using Courier.API.DTOs;
using Courier.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Courier.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Rider")]
    public class RiderAppController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RiderAppController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<Rider?> GetCurrentRiderAsync()
        {
            var userIdStr = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return null;
            }

            return await _context.Riders.FirstOrDefaultAsync(r => r.UserId == userId);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingDeliveries()
        {
            var rider = await GetCurrentRiderAsync();
            if (rider == null) return Unauthorized();

            var orders = await _context.Orders
                .Where(o => o.AssignedRiderId == rider.Id && o.Status != "Delivered" && !o.Status.StartsWith("Failed") && o.Status != "Cancelled" && o.Status != "Returned")
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new {
                    o.Id,
                    o.TrackingNumber,
                    o.CustomerName,
                    o.Address,
                    o.Phone1,
                    o.Phone2,
                    o.CODAmount,
                    o.Status,
                    o.Remarks,
                    o.CreatedAt
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("completed")]
        public async Task<IActionResult> GetCompletedDeliveries()
        {
            var rider = await GetCurrentRiderAsync();
            if (rider == null) return Unauthorized();

            var orders = await _context.Orders
                .Where(o => o.AssignedRiderId == rider.Id && o.Status == "Delivered")
                .OrderByDescending(o => o.StatusChangedAt)
                .Select(o => new {
                    o.Id,
                    o.TrackingNumber,
                    o.CustomerName,
                    o.Address,
                    o.Phone1,
                    o.CODAmount,
                    o.Status,
                    o.StatusChangedAt
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("failed")]
        public async Task<IActionResult> GetFailedDeliveries()
        {
            var rider = await GetCurrentRiderAsync();
            if (rider == null) return Unauthorized();

            var orders = await _context.Orders
                .Where(o => o.AssignedRiderId == rider.Id && (o.Status.StartsWith("Failed") || o.Status == "Cancelled"))
                .OrderByDescending(o => o.StatusChangedAt)
                .Select(o => new {
                    o.Id,
                    o.TrackingNumber,
                    o.CustomerName,
                    o.Address,
                    o.Phone1,
                    o.CODAmount,
                    o.Status,
                    o.StatusChangedAt
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPost("{trackingNumber}/status")]
        public async Task<IActionResult> UpdateStatus(string trackingNumber, [FromBody] RiderUpdateStatusDto dto)
        {
            var rider = await GetCurrentRiderAsync();
            if (rider == null) return Unauthorized();

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.TrackingNumber == trackingNumber);
            if (order == null || order.AssignedRiderId != rider.Id)
            {
                return NotFound("Order not found or not assigned to you.");
            }

            order.Status = dto.Status;
            order.StatusChangedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime();
            if (dto.Status == "Delivered")
            {
                order.CompletedAt = order.StatusChangedAt;
            }

            var userIdStr = User.Claims.FirstOrDefault(c => c.Type == "userId")?.Value;
            int updatedBy = 0;
            if (!string.IsNullOrEmpty(userIdStr)) { int.TryParse(userIdStr, out updatedBy); }

            var history = new OrderStatusHistory
            {
                OrderId = order.Id,
                Status = dto.Status,
                Location = dto.Location ?? "Field",
                Remarks = dto.Remarks ?? "Updated by Rider",
                UpdatedAt = order.StatusChangedAt.Value,
                UpdatedBy = updatedBy
            };

            _context.OrderStatusHistory.Add(history);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated successfully" });
        }
    }

    public class RiderUpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string? Remarks { get; set; }
    }
}
