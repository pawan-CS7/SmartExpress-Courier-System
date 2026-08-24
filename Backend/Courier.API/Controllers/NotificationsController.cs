using Courier.API.DTOs;
using Courier.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Courier.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,SuperAdmin,BranchManager")]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Notifications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotifications([FromQuery] int limit = 50)
        {
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst("userId")?.Value ?? User.FindFirst("nameid")?.Value;
            
            var query = _context.Notifications.AsQueryable();

            if (userRole == "BranchManager" && int.TryParse(userIdStr, out int uId))
            {
                query = query.Where(n => n.TargetId == uId);
            }
            else
            {
                // Admins see notifications with null TargetId (general) or their own TargetId, 
                // but let's assume they can see all for now or just general ones.
                // Assuming Admin sees all for simplicity as per original code, or restrict to general.
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(limit)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Category = n.Category,
                    Message = n.Message,
                    TargetId = n.TargetId,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();

            return Ok(notifications);
        }

        // GET: api/Notifications/unread-count
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst("userId")?.Value ?? User.FindFirst("nameid")?.Value;
            
            var query = _context.Notifications.AsQueryable();

            if (userRole == "BranchManager" && int.TryParse(userIdStr, out int uId))
            {
                query = query.Where(n => n.TargetId == uId);
            }

            var count = await query.CountAsync(n => !n.IsRead);
            return Ok(new { count });
        }

        // PUT: api/Notifications/5/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/Notifications/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value ?? User.FindFirst("role")?.Value;
            var userIdStr = User.FindFirst("userId")?.Value ?? User.FindFirst("nameid")?.Value;
            
            var query = _context.Notifications.AsQueryable();

            if (userRole == "BranchManager" && int.TryParse(userIdStr, out int uId))
            {
                query = query.Where(n => n.TargetId == uId);
            }

            var unreadNotifications = await query
                .Where(n => !n.IsRead)
                .ToListAsync();

            foreach (var n in unreadNotifications)
            {
                n.IsRead = true;
            }

            if (unreadNotifications.Any())
            {
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
    }
}
