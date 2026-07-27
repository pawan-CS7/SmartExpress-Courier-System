using Courier.API.DTOs;
using Courier.API.Entities;

namespace Courier.API.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User> CreateUserAsync(RegisterUserDto dto)
        {
            var hashedPassword = global::BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                NIC = dto.NIC,
                Address = dto.Address,
                PasswordHash = hashedPassword,
                Role = dto.Role,
                BranchId = dto.BranchId,
                ClientId = dto.ClientId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }
    }
}