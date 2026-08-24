using Courier.API.DTOs;
using Courier.API.Services;
using Courier.API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Courier.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly AppDbContext _context;

        public UsersController(UserService userService, AppDbContext context)
        {
            _userService = userService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterUserDto dto)
        {
            var user = await _userService.CreateUserAsync(dto);
            return Ok(user);
        }

        [Authorize(Roles = "Admin,BranchManager")]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var userRole = User.FindFirst("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value ?? User.FindFirst("role")?.Value;
            var branchIdClaim = User.FindFirst("branchId")?.Value;

            var query = _context.Users.AsQueryable();

            if (userRole == "BranchManager" && int.TryParse(branchIdClaim, out int bId))
            {
                query = query.Where(u => u.BranchId == bId);
            }

            var users = await query
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Phone,
                    u.NIC,
                    u.Address,
                    u.Role,
                    u.BranchId,
                    u.IsActive,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("update-role/{id}")]
        public async Task<IActionResult> UpdateRoleAndStatus(int id, [FromBody] UpdateRoleDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (!string.IsNullOrEmpty(dto.Role))
            {
                user.Role = dto.Role;
            }

            if (dto.IsActive.HasValue)
            {
                user.IsActive = dto.IsActive.Value;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "User updated successfully" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("update-branch/{id}")]
        public async Task<IActionResult> UpdateUserBranch(int id, [FromBody] UpdateBranchDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.BranchId = dto.BranchId;

            await _context.SaveChangesAsync();
            return Ok(new { message = "User branch updated successfully" });
        }
    }

    public class UpdateBranchDto
    {
        public int? BranchId { get; set; }
    }

    public class UpdateRoleDto
    {
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }
}