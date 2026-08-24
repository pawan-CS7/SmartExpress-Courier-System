using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using Courier.API.Entities;
using System.Text;

namespace Courier.API.Services
{
    public interface ITrackingNumberService
    {
        Task<string> GenerateTrackingNumberAsync();
    }

    public class TrackingNumberService : ITrackingNumberService
    {
        private readonly AppDbContext _context;

        public TrackingNumberService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateTrackingNumberAsync()
        {
            // We use a separate transaction to ensure prefix increment is atomic and safe
            // But since this might be called in a loop for multiple waybills, we just read the prefix.
            // If it saturates, we increment it.
            
            string trackingNumber;
            bool isUnique = false;
            int retryCount = 0;

            do
            {
                // 1. Get current prefix
                var prefixState = await _context.TrackingPrefixStates.FirstOrDefaultAsync();
                if (prefixState == null)
                {
                    prefixState = new TrackingPrefixState { CurrentPrefix = "AA" };
                    _context.TrackingPrefixStates.Add(prefixState);
                    await _context.SaveChangesAsync();
                }

                // 2. Generate 6 random digits cryptographically
                string randomDigits = GenerateRandomDigits(6);
                trackingNumber = $"{prefixState.CurrentPrefix}{randomDigits}";

                // 3. Check uniqueness in Orders and Waybills
                bool existsInOrders = await _context.Orders.AnyAsync(o => o.TrackingNumber == trackingNumber);
                bool existsInWaybills = await _context.Waybills.AnyAsync(w => w.Barcode == trackingNumber);

                if (!existsInOrders && !existsInWaybills)
                {
                    isUnique = true;
                }
                else
                {
                    retryCount++;
                    if (retryCount >= 50)
                    {
                        // Prefix saturation, increment prefix
                        prefixState.CurrentPrefix = IncrementPrefix(prefixState.CurrentPrefix);
                        _context.TrackingPrefixStates.Update(prefixState);
                        await _context.SaveChangesAsync();
                        retryCount = 0; // Reset retry counter for new prefix
                    }
                }

            } while (!isUnique);

            return trackingNumber;
        }

        private string GenerateRandomDigits(int length)
        {
            var sb = new StringBuilder(length);
            for (int i = 0; i < length; i++)
            {
                // RandomNumberGenerator.GetInt32 is cryptographically secure
                sb.Append(RandomNumberGenerator.GetInt32(0, 10));
            }
            return sb.ToString();
        }

        private string IncrementPrefix(string currentPrefix)
        {
            if (string.IsNullOrEmpty(currentPrefix) || currentPrefix.Length != 2)
            {
                return "AA";
            }

            char c1 = currentPrefix[0];
            char c2 = currentPrefix[1];

            if (c2 < 'Z')
            {
                c2++;
            }
            else
            {
                c2 = 'A';
                if (c1 < 'Z')
                {
                    c1++;
                }
                else
                {
                    // If we hit ZZ, loop back to AA (or handle differently if needed)
                    c1 = 'A';
                }
            }

            return $"{c1}{c2}";
        }
    }
}
