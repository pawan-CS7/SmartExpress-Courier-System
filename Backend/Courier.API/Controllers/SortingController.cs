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
    [Authorize(Roles = "SortingCenterManager,Admin")]
    public class SortingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SortingController(AppDbContext context)
        {
            _context = context;
        }

        public class InboundRequestDto
        {
            public string TrackingNumber { get; set; } = string.Empty;
        }

        [HttpPost("inbound")]
        public async Task<IActionResult> InboundScan([FromBody] InboundRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.TrackingNumber))
            {
                return BadRequest(new { message = "Tracking number is required." });
            }

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.TrackingNumber == request.TrackingNumber);
            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            var alreadyExistsInbound = await _context.OrderStatusHistory
                .AnyAsync(h => h.OrderId == order.Id && h.Status == "Collected at Warehouse");

            if (alreadyExistsInbound)
            {
                return BadRequest(new { message = "This parcel already has a 'Collected at Warehouse' record in its history (Duplicate Scan)." });
            }

            if (order.Status != "Dispatched to Warehouse")
            {
                return BadRequest(new { message = $"Order must be 'Dispatched to Warehouse' before inbound scanning. Current status is '{order.Status}'." });
            }

            var userIdString = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? parsedUserId = null;
            string hubName = "Main Warehouse";

            if (!string.IsNullOrEmpty(userIdString) && int.TryParse(userIdString, out int userId))
            {
                parsedUserId = userId;
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user?.BranchId != null)
                {
                    var branch = await _context.Branches.FindAsync(user.BranchId);
                    if (branch != null && branch.IsSortingCenter)
                    {
                        hubName = branch.Name;
                        order.CurrentBranchId = user.BranchId;
                    }
                }
            }

            // Update Status
            order.Status = "Collected at Warehouse";
            order.StatusChangedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime();

            // Add History
            var history = new OrderStatusHistory
            {
                OrderId = order.Id,
                Status = "Collected at Warehouse",
                Location = hubName,
                Remarks = "Parcel received at warehouse.",
                UpdatedBy = parsedUserId,
                UpdatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
            };

            _context.OrderStatusHistory.Add(history);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Inbound scan successful.",
                orderId = order.Id,
                trackingNumber = order.TrackingNumber,
                status = order.Status
            });
        }

        public class OutboundRequestDto
        {
            public string TrackingNumber { get; set; } = string.Empty;
            public int TargetBranchId { get; set; }
        }

        [HttpPost("outbound")]
        public async Task<IActionResult> OutboundScan([FromBody] OutboundRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.TrackingNumber))
            {
                return BadRequest(new { message = "Tracking number is required." });
            }

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.TrackingNumber == request.TrackingNumber);
            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            var targetBranch = await _context.Branches.FindAsync(request.TargetBranchId);
            if (targetBranch == null)
            {
                return BadRequest(new { message = "Target destination branch not found." });
            }

            if (order.Status != "Collected at Warehouse")
            {
                return BadRequest(new { message = $"Order must be 'Collected at Warehouse' before dispatching. Current status is '{order.Status}'." });
            }

            var alreadyExistsOutbound = await _context.OrderStatusHistory
                .AnyAsync(h => h.OrderId == order.Id && h.Status == "Dispatched to Destination Branch" && order.DestinationBranchId == request.TargetBranchId);

            if (alreadyExistsOutbound)
            {
                return BadRequest(new { message = $"This parcel already has a 'Dispatched to Destination Branch' record for {targetBranch.Name} (Duplicate Scan)." });
            }

            var userIdString = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? parsedUserId = null;
            string hubName = "Main Warehouse";

            if (!string.IsNullOrEmpty(userIdString) && int.TryParse(userIdString, out int userId))
            {
                parsedUserId = userId;
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user?.BranchId != null)
                {
                    var branch = await _context.Branches.FindAsync(user.BranchId);
                    if (branch != null && branch.IsSortingCenter)
                    {
                        hubName = branch.Name;
                        order.CurrentBranchId = user.BranchId;
                    }
                }
            }

            // TargetBranch is conceptually the DestinationBranchId (where it is heading)
            order.DestinationBranchId = request.TargetBranchId;
            order.TempBranchId = request.TargetBranchId;
            order.Status = "Dispatched to Destination Branch";
            order.StatusChangedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime();

            var history = new OrderStatusHistory
            {
                OrderId = order.Id,
                Status = "Dispatched to Destination Branch",
                Location = hubName,
                Remarks = $"Heading to {targetBranch.Name}",
                UpdatedBy = parsedUserId,
                UpdatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
            };

            _context.OrderStatusHistory.Add(history);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Outbound scan successful.",
                orderId = order.Id,
                trackingNumber = order.TrackingNumber,
                status = order.Status,
                destination = targetBranch.Name
            });
        }
    }
}
