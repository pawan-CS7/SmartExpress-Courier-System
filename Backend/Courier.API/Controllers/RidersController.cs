using Courier.API;
using Courier.API.DTOs;
using Courier.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq;

namespace Courier.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,BranchManager")]
    public class RidersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RidersController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetUserBranchId()
        {
            var claim = User.Claims.FirstOrDefault(c => c.Type.Equals("branchId", StringComparison.OrdinalIgnoreCase));
            if (claim != null && int.TryParse(claim.Value, out var branchId))
                return branchId;
            return null;
        }

        [HttpGet]
        public async Task<IActionResult> GetRiders()
        {
            var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            var userBranchId = GetUserBranchId();

            var query = _context.Riders.Include(r => r.Branch).Include(r => r.User).AsQueryable();

            if (userRole == "BranchManager" && userBranchId.HasValue)
            {
                query = query.Where(r => r.BranchId == userBranchId.Value);
            }

            var riders = await query
                .Select(r => new RiderDto
                {
                    Id = r.Id,
                    RiderId = r.RiderId,
                    Name = r.Name,
                    Phone = r.Phone,
                    BranchId = r.BranchId,
                    BranchName = r.Branch.Name,
                    Email = r.User != null ? r.User.Email : "",
                    IsActive = r.IsActive,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(riders);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRider(CreateRiderDto dto)
        {
            var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            var userBranchId = GetUserBranchId();

            if (userRole == "BranchManager" && userBranchId.HasValue && dto.BranchId != userBranchId.Value)
            {
                return Forbid();
            }

            if (!await _context.Branches.AnyAsync(b => b.Id == dto.BranchId))
            {
                return BadRequest("Invalid BranchId");
            }

            var isExistingEmail = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (isExistingEmail)
            {
                return BadRequest(new { message = "Email is already in use by another account." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var newUser = new User
                {
                    Name = dto.Name,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    NIC = "",
                    Address = "",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    Role = "Rider",
                    BranchId = dto.BranchId,
                    IsActive = true,
                    CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                var maxRiderId = await _context.Riders
                    .OrderByDescending(r => r.Id)
                    .Select(r => r.RiderId)
                    .FirstOrDefaultAsync();

                int nextId = 1;
                if (!string.IsNullOrEmpty(maxRiderId) && maxRiderId.StartsWith("R"))
                {
                    if (int.TryParse(maxRiderId.Substring(1), out int currentMax))
                    {
                        nextId = currentMax + 1;
                    }
                }
                
                string newRiderId = $"R{nextId:D2}"; // R01, R02, etc.

                var rider = new Rider
                {
                    RiderId = newRiderId,
                    Name = dto.Name,
                    Phone = dto.Phone,
                    BranchId = dto.BranchId,
                    UserId = newUser.Id,
                    IsActive = true
                };

                _context.Riders.Add(rider);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(rider);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while creating the rider.", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRider(int id, UpdateRiderDto dto)
        {
            var rider = await _context.Riders.FindAsync(id);
            if (rider == null) return NotFound();

            var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            var userBranchId = GetUserBranchId();

            if (userRole == "BranchManager" && userBranchId.HasValue && rider.BranchId != userBranchId.Value)
            {
                return Forbid();
            }

            if (userRole == "BranchManager" && userBranchId.HasValue && dto.BranchId != userBranchId.Value)
            {
                return Forbid();
            }

            if (!await _context.Branches.AnyAsync(b => b.Id == dto.BranchId))
            {
                return BadRequest("Invalid BranchId");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                rider.Name = dto.Name;
                rider.Phone = dto.Phone;
                rider.BranchId = dto.BranchId;
                rider.IsActive = dto.IsActive;

                if (rider.UserId.HasValue)
                {
                    var user = await _context.Users.FindAsync(rider.UserId.Value);
                    if (user != null)
                    {
                        var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != user.Id);
                        if (emailExists)
                        {
                            return BadRequest(new { message = "Email is already in use by another account." });
                        }

                        user.Name = dto.Name;
                        user.Phone = dto.Phone;
                        user.Email = dto.Email;
                        user.IsActive = dto.IsActive;
                        user.BranchId = dto.BranchId;

                        if (!string.IsNullOrEmpty(dto.Password))
                        {
                            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return Ok(rider);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while updating the rider.", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRider(int id)
        {
            var rider = await _context.Riders.FindAsync(id);
            if (rider == null) return NotFound();

            var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            var userBranchId = GetUserBranchId();

            if (userRole == "BranchManager" && userBranchId.HasValue && rider.BranchId != userBranchId.Value)
            {
                return Forbid();
            }

            var hasOrders = await _context.Orders.AnyAsync(o => o.AssignedRiderId == id);
            if (hasOrders)
            {
                return BadRequest(new { message = "Cannot delete this rider because they are assigned to existing orders. Please deactivate them instead." });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (rider.UserId.HasValue)
                {
                    var user = await _context.Users.FindAsync(rider.UserId.Value);
                    if (user != null)
                    {
                        _context.Users.Remove(user);
                    }
                }

                _context.Riders.Remove(rider);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Rider permanently deleted" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred while deleting the rider.", details = ex.Message });
            }
        }
    }
}
