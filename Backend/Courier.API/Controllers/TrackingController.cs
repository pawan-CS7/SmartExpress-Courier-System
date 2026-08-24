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
                .FirstOrDefaultAsync(o => o.TrackingNumber == trackingNo);

            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            // Security check for clients and branch managers
            if (roleClaim != "Admin" && !User.IsInRole("Admin"))
            {
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
                {
                    var user = await _context.Users.FindAsync(userId);
                    
                    if (roleClaim == "BranchManager")
                    {
                        if (order.OriginBranchId != user.BranchId && order.DestinationBranchId != user.BranchId)
                        {
                            return Forbid();
                        }
                    }
                    else // Client
                    {
                        if (user == null || order.ClientId != (user.ClientId ?? 0))
                        {
                            return Forbid();
                        }
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

            var userIds = history.Where(h => h.UpdatedBy != null).Select(h => h.UpdatedBy.Value).Distinct().ToList();
            var users = await _context.Users.Where(u => userIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u.Name ?? u.Email);

            var result = new OrderTrackingDto
            {
                OrderId = order.Id,
                TrackingNumber = order.TrackingNumber,
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
                    UpdatedBy = h.UpdatedBy.HasValue && users.ContainsKey(h.UpdatedBy.Value) ? users[h.UpdatedBy.Value] : (h.UpdatedBy.HasValue ? h.UpdatedBy.ToString() : "System")
                }).ToList()
            };

            return Ok(result);
        }

        [Authorize(Roles = "Admin,BranchManager,SortingCenterManager")]
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

            var alreadyExists = await _context.OrderStatusHistory
                .AnyAsync(h => h.OrderId == orderId && h.Status == dto.Status);

            if (alreadyExists)
            {
                return BadRequest(new { message = $"Order already has a '{dto.Status}' record in its history. Cannot duplicate this tracking update." });
            }

            var roleClaim = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? updatedBy = null;
            User user = null;

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int parsedUserId))
            {
                updatedBy = parsedUserId;
                user = await _context.Users.FindAsync(parsedUserId);
                
                if (roleClaim == "BranchManager" && user != null)
                {
                    if (order.OriginBranchId != user.BranchId && order.DestinationBranchId != user.BranchId)
                    {
                        return Forbid();
                    }
                }
            }

            var newHistory = new OrderStatusHistory
            {
                OrderId = orderId,
                Status = dto.Status,
                Location = dto.Location,
                Remarks = dto.Remarks,
                UpdatedBy = updatedBy,
                UpdatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
            };

            _context.OrderStatusHistory.Add(newHistory);

            order.Status = dto.Status;
            order.StatusChangedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime();

            if (roleClaim == "BranchManager" && user != null)
            {
                order.CurrentBranchId = user.BranchId;
            }

            if (dto.Status == "Delivered")
            {
                order.CompletedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime();
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Tracking updated successfully." });
        }
    }
}
