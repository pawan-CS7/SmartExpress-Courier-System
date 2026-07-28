using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Courier.API.Entities;
using System.Security.Claims;

namespace Courier.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoiceController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InvoiceController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("my")]
        [Authorize(Roles = "Client")]
        public async Task<IActionResult> GetMyInvoices()
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || user.ClientId == null) return Unauthorized();

            var invoices = await _context.Invoices
                .Where(i => i.ClientId == user.ClientId)
                .OrderByDescending(i => i.InvoiceDate)
                .ToListAsync();

            return Ok(invoices);
        }
    }
}
