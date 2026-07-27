using Courier.API;
using Courier.API.DTOs;
using Courier.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")] 
public class StaffController : ControllerBase
{
    private readonly AppDbContext _context;

    public StaffController(AppDbContext context)
    {
        _context = context;
    }


    [HttpPost]
    public async Task<IActionResult> CreateStaff(CreateStaffDto dto)
    {
        if (await _context.Users.AnyAsync(x => x.Email == dto.Email))
            return BadRequest("Email already exists");

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role,
            NIC = dto.Nic,
            Address = dto.Address,
            Phone = dto.MobileNo,
            BranchId = dto.BranchId,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(user);
    }


    [HttpGet]
    public async Task<IActionResult> GetStaff()
    {
        var staff = await _context.Users
            .Where(x => x.Role != "Client")
            .ToListAsync();

        return Ok(staff);
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateStaff(int id, UpdateStaffDto dto)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        user.Name = dto.Name;
        user.Role = dto.Role;
        user.NIC = dto.Nic;
        user.Address = dto.Address;
        user.Phone = dto.MobileNo;
        user.BranchId = dto.BranchId;
        user.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();

        return Ok(user);
    }

  
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStaff(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        user.IsActive = false;

        await _context.SaveChangesAsync();

        return Ok("Staff deactivated");
    }
}