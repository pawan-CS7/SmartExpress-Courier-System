using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    [Authorize]
    [HttpGet]
    public IActionResult GetOrders()
    {
        var userId = User.FindFirst("userId")?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        return Ok(new
        {
            message = "Protected data",
            userId,
            role
        });
    }
}