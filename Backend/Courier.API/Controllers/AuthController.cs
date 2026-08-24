using Courier.API;
using Courier.API.DTOs;
using Courier.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DBUser = Courier.API.Entities.User;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(
        AuthService authService,
        AppDbContext context,
        IConfiguration config)
    {
        _authService = authService;
        _context = context;
        _config = config;
    }

    // ========================= LOGIN =========================
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);

        if (result == null)
            return Unauthorized(new
            {
                message = "Invalid email or password"
            });

        return Ok(result);
    }

    [HttpGet("reset-colomboc")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetColomboc()
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == "colomboc@gmail.com");
        if (user != null)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Colomboc123");
            await _context.SaveChangesAsync();
            return Ok("Password reset to Colomboc123");
        }
        return NotFound("User not found");
    }

    // ========================= REGISTER CLIENT =========================
    [HttpPost("register-client")]
    public async Task<IActionResult> RegisterClient([FromBody] ClientRegistrationDto dto)
    {
        var isExisting = await _context.Users.AnyAsync(u => u.Email == dto.Email);
        if (isExisting)
        {
            return BadRequest(new { message = "Email is already registered." });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var newClient = new Courier.API.Entities.Client
            {
                BusinessName = dto.Name ?? "",
                OwnerName = dto.Name ?? "",
                Email = dto.Email ?? "",
                Phone = dto.Phone ?? "",
                Address = dto.Address ?? "",
                NIC = dto.NIC ?? "",
                IsActive = true,
                CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime(),
                BranchId = dto.BranchId
            };
            _context.Clients.Add(newClient);
            await _context.SaveChangesAsync();
            
            var newUser = new DBUser
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                NIC = dto.NIC,
                Address = dto.Address,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Client",
                BranchId = dto.BranchId,
                ClientId = newClient.Id, 
                IsActive = true,
                CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            // Find Admin user
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
            if (adminUser != null) 
            {
                _context.Notifications.Add(new Courier.API.Entities.Notification
                {
                    Category = "New User",
                    Message = $"{dto.Name} ({dto.Email}) has just registered as a new client.",
                    TargetId = adminUser.Id, // Link to Admin User ID
                    IsRead = false,
                    CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
                });
            }

            // Add notification for Branch Manager if assigned to a branch
            if (dto.BranchId.HasValue && dto.BranchId.Value > 0)
            {
                var branchManager = await _context.Users
                    .FirstOrDefaultAsync(u => u.Role == "BranchManager" && u.BranchId == dto.BranchId.Value);
                
                if (branchManager != null)
                {
                    _context.Notifications.Add(new Courier.API.Entities.Notification
                    {
                        Category = "New Client Branch",
                        Message = $"A new client {dto.Name} has registered under your branch.",
                        TargetId = branchManager.Id, // Notify the branch manager
                        IsRead = false,
                        CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
                    });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Client registered successfully", clientId = newClient.Id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "An error occurred during registration.", details = ex.Message });
        }
    }

    [HttpGet("fix-missing-clients")]
    [AllowAnonymous]
    public async Task<IActionResult> FixMissingClients()
    {
        var usersWithClients = await _context.Users.Where(u => u.ClientId != null).ToListAsync();
        int fixedCount = 0;
        foreach(var u in usersWithClients)
        {
            var exists = await _context.Clients.AnyAsync(c => c.Id == u.ClientId);
            if (!exists)
            {
                try {
                    await _context.Database.ExecuteSqlRawAsync(
                        "SET IDENTITY_INSERT Clients ON; " +
                        "INSERT INTO Clients (Id, BusinessName, OwnerName, Email, Phone, IsActive, CreatedAt) " +
                        "VALUES ({0}, {1}, {2}, {3}, {4}, 1, GETUTCDATE()); " +
                        "SET IDENTITY_INSERT Clients OFF;", 
                        u.ClientId, u.Name ?? "Unknown", u.Name ?? "Unknown", u.Email ?? "", u.Phone ?? "");
                    fixedCount++;
                } catch {
                    try {
                        await _context.Database.ExecuteSqlRawAsync(
                            "INSERT INTO Clients (Id, BusinessName, OwnerName, Email, Phone, IsActive, CreatedAt) " +
                            "VALUES ({0}, {1}, {2}, {3}, {4}, 1, GETUTCDATE());", 
                            u.ClientId, u.Name ?? "Unknown", u.Name ?? "Unknown", u.Email ?? "", u.Phone ?? "");
                        fixedCount++;
                    } catch { }
                }
            }
        }
        return Ok(new { message = $"Fixed {fixedCount} missing client records in the database." });
    }

    [HttpGet("test-db")]
    [AllowAnonymous]
    public async Task<IActionResult> TestDb()
    {
        var user = await _context.Users.FindAsync(3);
        var client = user?.ClientId != null ? await _context.Clients.FindAsync(user.ClientId) : null;
        return Ok(new { User = user, Client = client });
    }

    // ========================= REFRESH TOKEN =========================
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(TokenDto dto)
    {
        var token = await _authService.RefreshTokenAsync(dto.RefreshToken);

        if (token == null)
            return Unauthorized(new
            {
                message = "Invalid refresh token"
            });

        return Ok(new
        {
            token
        });
    }

    // ========================= LOGOUT =========================
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst("userId")?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _context.Users.FindAsync(int.Parse(userId));

        if (user == null)
            return NotFound("User not found");

        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Logged out successfully"
        });
    }

    // ========================= FORGOT PASSWORD =========================
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordDto model,
        [FromServices] EmailService emailService)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == model.Email);

        if (user == null)
            return NotFound(new
            {
                message = "User not found"
            });

        var token = Guid.NewGuid().ToString();

        user.ResetToken = token;
        user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);

        await _context.SaveChangesAsync();

        var frontendUrl = _config["Frontend:BaseUrl"];

        if (string.IsNullOrEmpty(frontendUrl))
        {
            return StatusCode(500, new
            {
                message = "Frontend URL not configured"
            });
        }

        var resetLink = $"{frontendUrl}/reset-password?token={token}";

        await emailService.SendEmail(
            user.Email,
            "Reset Password",
            $"Click here to reset your password:<br/><br/>" +
            $"<a href='{resetLink}'>Reset Password</a>"
        );

        return Ok(new
        {
            message = "Reset email sent successfully 📩"
        });
    }

    // ========================= RESET PASSWORD =========================
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordDto model)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.ResetToken == model.Token &&
            u.ResetTokenExpiry > DateTime.UtcNow);

        if (user == null)
            return BadRequest(new
            {
                message = "Invalid or expired token"
            });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

        user.ResetToken = null;
        user.ResetTokenExpiry = null;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Password reset successful ✅"
        });
    }
}

public class ClientRegistrationDto
{
    public string Name { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string Phone { get; set; }
    public string NIC { get; set; }
    public string Address { get; set; }
    public int? BranchId { get; set; }
}