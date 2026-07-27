using Courier.API;
using Courier.API.DTOs;
using Courier.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ClientController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClientController(AppDbContext context)
    {
        _context = context;
    }


    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> CreateClient(CreateClientDto dto)
    {
        
        if (await _context.Users.AnyAsync(x => x.Email == dto.Email))
            return BadRequest("Email already exists");

        var client = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "Client", 
            Phone = dto.MobileNo,
            Address = dto.Address,
            NIC = dto.NIC,
            IsActive = true
        };

        _context.Users.Add(client);
        await _context.SaveChangesAsync();

        return Ok(client);
    }

  
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetClients()
    {
        var clients = await _context.Users
            .Where(x => x.Role == "Client")
            .ToListAsync();

        return Ok(clients);
    }
}