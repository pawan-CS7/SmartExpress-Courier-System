using Courier.API.DTOs;
using Courier.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Courier.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class TrackingController : Controller
    {
        private readonly AppDbContext _context;

        public TrackingController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet("{trackingNo}")]
        public async Task<IActionResult> GetTracking(string trackingNo)
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.WaybillId == trackingNo || o.OrderNo == trackingNo);

            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            // Security check for clients
            if (roleClaim != "Admin" && !User.IsInRole("Admin"))
            {
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
                {
                    var user = await _context.Users.FindAsync(userId);
                    if (user == null || order.ClientId != (user.ClientId ?? 0))
                    {
                        return Forbid();
                    }
                }
                else
                {
                    return Forbid();
                }
            }

            var history = await _context.OrderStatusHistory
                .Where(h => h.OrderId == order.Id)
                .OrderByDescending(h => h.UpdatedAt)
                .ToListAsync();

            var result = new OrderTrackingDto
            {
                OrderId = order.Id,
                WaybillId = order.WaybillId,
                OrderNo = order.OrderNo,
                CustomerName = order.CustomerName,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                CompletedAt = order.CompletedAt,
                History = history.Select(h => new TrackingHistoryDto
                {
                    Id = h.Id,
                    Status = h.Status,
                    Location = h.Location,
                    Remarks = h.Remarks,
                    UpdatedAt = h.UpdatedAt,
                    UpdatedBy = h.UpdatedBy?.ToString()
                }).ToList()
            };

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{orderId}")]
        public async Task<IActionResult> UpdateTracking(int orderId, [FromBody] UpdateTrackingDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? updatedBy = null;
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int parsedUserId))
            {
                updatedBy = parsedUserId;
            }

            var newHistory = new OrderStatusHistory
            {
                OrderId = orderId,
                Status = dto.Status,
                Location = dto.Location,
                Remarks = dto.Remarks,
                UpdatedBy = updatedBy,
                UpdatedAt = DateTime.Now
            };

            _context.OrderStatusHistory.Add(newHistory);

            order.Status = dto.Status;
            order.StatusChangedAt = DateTime.Now;

            if (dto.Status == "Delivered")
            {
                order.CompletedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Tracking updated successfully." });
        }
    }
}
