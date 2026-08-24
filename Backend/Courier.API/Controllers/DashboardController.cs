using Courier.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Courier.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class DashboardController : Controller
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var delivered = await _context.Orders.CountAsync(o => o.Status == "Delivered");
            var pending = await _context.Orders.CountAsync(o => o.Status == "Pending");
            var revenue = await _context.Orders.SumAsync(o => o.DeliveryCharge ?? 0);

            return Ok(new
            {
                TotalOrders = totalOrders,
                Delivered = delivered,
                Pending = pending,
                Revenue = revenue
            });
        }

        [HttpGet("client")]
        public async Task<IActionResult> GetClientDashboard()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Forbid();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.ClientId == null)
            {
                return Forbid();
            }

            int clientId = user.ClientId.Value;

            var orders = await _context.Orders
                .Where(o => o.ClientId == clientId)
                .ToListAsync();

            var result = new
            {
                Processing = orders.Count(o => o.Status == "Processing" || o.Status == "Pending"),
                Dispatched = orders.Count(o => o.Status == "Dispatched to Destination Branch" || o.Status == "Dispatched"),
                Collected = orders.Count(o => o.Status == "Collected from Warehouse" || o.Status == "Collected"),
                ReceivedDestination = orders.Count(o => o.Status == "Received at Destination Branch"),
                OutForDelivery = orders.Count(o => o.Status == "Out for Delivery" || o.Status == "Out"),
                Rescheduled = orders.Count(o => o.Status == "Rescheduled"),
                FailedToDeliver = orders.Count(o => o.Status == "Failed to Deliver" || o.Status == "Failed"),
                ReturnedToClient = orders.Count(o => o.Status == "Returned to Client"),
                ReturnedBranchRescheduled = orders.Count(o => o.Status == "Returned to Branch Rescheduled"),
                ReturnedBranchFailed = orders.Count(o => o.Status == "Returned to Branch Failed"),
                
                // Finance overview
                ReceivableCOD = orders.Where(o => o.Status != "Delivered" && o.Status != "Failed").Sum(o => o.CODAmount ?? 0),
                NetReceivable = orders.Where(o => o.Status != "Delivered" && o.Status != "Failed").Sum(o => (o.CODAmount ?? 0) - (o.DeliveryCharge ?? 0)),
                TotalReceived = orders.Where(o => o.Status == "Delivered").Sum(o => o.CODAmount ?? 0)
            };

            return Ok(result);
        }
    }
}
