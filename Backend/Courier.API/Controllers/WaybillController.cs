using Courier.API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Courier.API.Services;

namespace Courier.API.Controllers
{
    [Authorize] 
    [ApiController]
    [Route("api/[controller]")]
    public class WaybillController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITrackingNumberService _trackingNumberService;

        public WaybillController(AppDbContext context, ITrackingNumberService trackingNumberService)
        {
            _context = context;
            _trackingNumberService = trackingNumberService;
        }

        // ========================= GET ALL REQUESTS =========================
        [HttpGet]
        public async Task<IActionResult> GetAllRequests([FromQuery] int? branchId)
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (roleClaim == "Admin" || roleClaim == "Owner" || User.IsInRole("Admin"))
            {
                var query = _context.WaybillRequests.AsQueryable();

                if (branchId.HasValue)
                {
                    var clientIds = await _context.Users
                        .Where(u => u.BranchId == branchId.Value && u.ClientId != null)
                        .Select(u => u.ClientId.Value)
                        .ToListAsync();
                    query = query.Where(wr => clientIds.Contains(wr.ClientId));
                }

                var requests = await query
                    .Join(_context.Users.Where(u => u.ClientId != null),
                        wr => wr.ClientId,
                        u => u.ClientId,
                        (wr, u) => new
                        {
                            wr.Id,
                            wr.ClientId,
                            ClientName = u.Name,
                            wr.NoOfWaybills,
                            wr.NoOfBarcodes,
                            wr.FromBarcode,
                            wr.ToBarcode,
                            wr.Status,
                            wr.RequestedDate,
                            wr.ConfirmDate
                        }).ToListAsync();
                return Ok(requests);
            }

            if (roleClaim == "BranchManager")
            {
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int bmUserId))
                {
                    var bmUser = await _context.Users.FindAsync(bmUserId);
                    if (bmUser?.BranchId != null)
                    {
                        var clientIds = await _context.Users
                            .Where(u => u.BranchId == bmUser.BranchId && u.ClientId != null)
                            .Select(u => u.ClientId.Value)
                            .ToListAsync();
                            
                        var requests = await _context.WaybillRequests
                            .Where(wr => clientIds.Contains(wr.ClientId))
                            .Join(_context.Users.Where(u => u.ClientId != null),
                                wr => wr.ClientId,
                                u => u.ClientId,
                                (wr, u) => new
                                {
                                    wr.Id,
                                    wr.ClientId,
                                    ClientName = u.Name,
                                    wr.NoOfWaybills,
                                    wr.NoOfBarcodes,
                                    wr.FromBarcode,
                                    wr.ToBarcode,
                                    wr.Status,
                                    wr.RequestedDate,
                                    wr.ConfirmDate
                                }).ToListAsync();
                        return Ok(requests);
                    }
                }
                return Ok(new List<object>());
            }

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int clientUserId))
            {
                var user = await _context.Users.FindAsync(clientUserId);
                if (user != null)
                {
                    var clientRequests = await _context.WaybillRequests
                        .Where(x => x.ClientId == (user.ClientId ?? 0))
                        .Join(_context.Users.Where(u => u.ClientId != null),
                            wr => wr.ClientId,
                            u => u.ClientId,
                            (wr, u) => new
                            {
                                wr.Id,
                                wr.ClientId,
                                ClientName = u.Name,
                                wr.NoOfWaybills,
                                wr.NoOfBarcodes,
                                wr.FromBarcode,
                                wr.ToBarcode,
                                wr.Status,
                                wr.RequestedDate,
                                wr.ConfirmDate
                            }).ToListAsync();
                    return Ok(clientRequests);
                }
            }

            return Ok(new List<WaybillRequest>());
        }

        // ========================= GET MY REQUESTS =========================
        [HttpGet("myrequests")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (roleClaim == "Admin" || User.IsInRole("Admin"))
            {
                var requests = await _context.WaybillRequests.ToListAsync();
                return Ok(requests);
            }

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    var requests = await _context.WaybillRequests
                        .Where(x => x.ClientId == (user.ClientId ?? 0))
                        .ToListAsync();
                    return Ok(requests);
                }
            }

            return Ok(new List<WaybillRequest>());
        }

        // ========================= GET ALL BARCODES =========================
        [HttpGet("all-barcodes")]
        public async Task<IActionResult> GetAllBarcodes([FromQuery] int? branchId)
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (roleClaim == "Admin" || roleClaim == "Owner" || User.IsInRole("Admin"))
            {
                var query = _context.Waybills.AsQueryable();

                if (branchId.HasValue)
                {
                    var clientIds = await _context.Users
                        .Where(u => u.BranchId == branchId.Value && u.ClientId != null)
                        .Select(u => u.ClientId.Value)
                        .ToListAsync();
                    query = query.Where(w => clientIds.Contains(w.ClientId));
                }

                var waybills = await query.ToListAsync();
                return Ok(waybills);
            }

            if (roleClaim == "BranchManager")
            {
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int bmUserId))
                {
                    var bmUser = await _context.Users.FindAsync(bmUserId);
                    if (bmUser?.BranchId != null)
                    {
                        var clientIds = await _context.Users
                            .Where(u => u.BranchId == bmUser.BranchId && u.ClientId != null)
                            .Select(u => u.ClientId.Value)
                            .ToListAsync();
                            
                        var waybills = await _context.Waybills
                            .Where(w => clientIds.Contains(w.ClientId))
                            .ToListAsync();
                        return Ok(waybills);
                    }
                }
                return Ok(new List<Waybill>());
            }

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int clientUserId))
            {
                var user = await _context.Users.FindAsync(clientUserId);
                if (user != null)
                {
                    var waybills = await _context.Waybills
                        .Where(x => x.ClientId == (user.ClientId ?? 0))
                        .ToListAsync();
                    return Ok(waybills);
                }
            }

            return Ok(new List<Waybill>());
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableBarcodes()
        {
            try 
            {
                var userIdString = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized(new { message = "Token missing userId claim." });

                var user = await _context.Users.FindAsync(int.Parse(userIdString));
                if (user == null) return Unauthorized(new { message = "User not found in database." });
                if (user.ClientId == null) return Unauthorized(new { message = "User is not mapped to a Client." });

                int clientId = user.ClientId ?? 0;

                var availableWaybills = await _context.Waybills
                    .Where(w => w.ClientId == clientId && w.IsUsed == false)
                    .Select(w => new { w.Id, w.Barcode })
                    .ToListAsync();

                return Ok(availableWaybills);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        // ========================= CREATE REQUEST =========================
        [HttpPost("request")]
        public async Task<IActionResult> CreateRequest([FromBody] WaybillRequest request)
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Courier.API.Entities.User user = null;
            
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
            {
                user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    request.ClientId = user.ClientId ?? 0;
                }
            }

            request.Status = "Pending";
            request.RequestedDate = Courier.API.Utils.TimeUtil.GetSriLankaTime();

            _context.WaybillRequests.Add(request);
            await _context.SaveChangesAsync();

            // Auto-generate notification
            var clientName = user?.Name ?? "A Client";

            // Notify Admin
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
            if (adminUser != null)
            {
                _context.Notifications.Add(new Notification
                {
                    Category = "Waybill Request",
                    Message = $"{clientName} has requested {request.NoOfWaybills} new waybills.",
                    TargetId = adminUser.Id,
                    IsRead = false,
                    CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
                });
            }

            // Notify Branch Manager
            if (user?.BranchId != null)
            {
                var branchManager = await _context.Users.FirstOrDefaultAsync(u => u.BranchId == user.BranchId && u.Role == "BranchManager");
                if (branchManager != null)
                {
                    _context.Notifications.Add(new Notification
                    {
                        Category = "Waybill Request",
                        Message = $"{clientName} has requested {request.NoOfWaybills} new waybills.",
                        TargetId = branchManager.Id,
                        IsRead = false,
                        CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
                    });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(request);
        }

        [Authorize(Roles = "Admin,BranchManager,Owner")]
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveRequest(int id)
        {
            var request = await _context.WaybillRequests.FindAsync(id);

            if (request == null)
                return NotFound(new { message = "Waybill request not found." });

            // Generate barcode using the branch of the client who requested it
            var clientUser = await _context.Users.FirstOrDefaultAsync(u => u.ClientId == request.ClientId);
            if (clientUser == null || clientUser.BranchId == null)
            {
                return BadRequest(new { message = "Client or Branch not found. Cannot generate barcodes for unassigned clients." });
            }

            try
            {
                var waybills = new List<Waybill>();

                for (int i = 0; i < request.NoOfWaybills; i++)
                {
                    string barcode = await _trackingNumberService.GenerateTrackingNumberAsync();

                    waybills.Add(new Waybill
                    {
                        Barcode = barcode,
                        ClientId = request.ClientId,
                        WaybillRequestId = request.Id,
                        IsUsed = false
                    });
                }

                request.FromBarcode = waybills.First().Barcode;
                request.ToBarcode = waybills.Last().Barcode;
                request.NoOfBarcodes = request.NoOfWaybills;
                request.Status = "Done";
                request.ConfirmDate = Courier.API.Utils.TimeUtil.GetSriLankaTime();

                _context.Waybills.AddRange(waybills);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    request.FromBarcode,
                    request.ToBarcode,
                    Count = waybills.Count
                });
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "An internal database error occurred while saving the waybills.", details = ex.InnerException?.Message });
            }
        }
        [HttpGet("client/{id}")]
        [Authorize(Roles = "Admin,BranchManager,Owner")]
        public async Task<IActionResult> GetClientDetails(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.ClientId == id);
            if (user == null) return NotFound();
            
            return Ok(new {
                businessName = user.Name,
                ownerName = user.Name,
                nic = user.NIC,
                email = user.Email,
                phone = user.Phone,
                address = user.Address,
                bankName = "N/A",
                accountNumber = "N/A"
            });
        }
    }
}