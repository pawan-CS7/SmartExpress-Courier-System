using Courier.API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Courier.API.Controllers
{
    [Authorize] 
    [Route("api/[controller]")]
    public class WaybillController : Controller
    {
        private readonly AppDbContext _context;

        public WaybillController(AppDbContext context)
        {
            _context = context;
        }

        // ========================= GET ALL REQUESTS =========================
        [HttpGet]
        public async Task<IActionResult> GetAllRequests()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (roleClaim == "Admin" || User.IsInRole("Admin"))
            {
                var requests = await _context.WaybillRequests
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

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
            {
                var user = await _context.Users.FindAsync(userId);
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
        public async Task<IActionResult> GetAllBarcodes()
        {
            var userIdClaim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst("role")?.Value ?? User.FindFirst(ClaimTypes.Role)?.Value;

            if (roleClaim == "Admin" || User.IsInRole("Admin"))
            {
                var waybills = await _context.Waybills.ToListAsync();
                return Ok(waybills);
            }

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
            {
                var user = await _context.Users.FindAsync(userId);
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
            
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    request.ClientId = user.ClientId ?? 0;
                }
            }

            request.Status = "Pending";
            request.RequestedDate = DateTime.UtcNow;

            _context.WaybillRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(request);
        }

        // ========================= APPROVE REQUEST (ADMIN ONLY) =========================
        [Authorize(Roles = "Admin")]
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveRequest(int id)
        {
            var request = await _context.WaybillRequests.FindAsync(id);

            if (request == null)
                return NotFound(new { message = "Waybill request not found." });

            var year = DateTime.Now.Year;
            var branchId = 1; 

            try
            {
                var sequence = await _context.WaybillSequences
                    .FirstOrDefaultAsync(x => x.BranchId == branchId && x.Year == year);

                if (sequence == null)
                {
                    sequence = new WaybillSequence
                    {
                        BranchId = branchId,
                        Year = year,
                        LastNumber = 0
                    };

                    _context.WaybillSequences.Add(sequence);
                }

                var waybills = new List<Waybill>();
                int start = sequence.LastNumber + 1;

                for (int i = 0; i < request.NoOfWaybills; i++)
                {
                    int number = start + i;
                    string barcode = $"{branchId}{year}{number.ToString("D6")}";

                    waybills.Add(new Waybill
                    {
                        Barcode = barcode,
                        ClientId = request.ClientId,
                        WaybillRequestId = request.Id
                    });
                }

                sequence.LastNumber += request.NoOfWaybills;

                request.FromBarcode = waybills.First().Barcode;
                request.ToBarcode = waybills.Last().Barcode;
                request.NoOfBarcodes = request.NoOfWaybills;
                request.Status = "Done";
                request.ConfirmDate = DateTime.UtcNow;

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
                if (ex.InnerException != null && ex.InnerException.Message.Contains("FK__WaybillSe__Branc"))
                {
                    return BadRequest(new { message = "Configuration Error: Branch ID 1 does not exist in the database. Please create a branch before approving requests." });
                }
                
                return StatusCode(500, new { message = "An internal database error occurred while saving the waybills.", details = ex.InnerException?.Message });
            }
        }
        [HttpGet("client/{id}")]
        [Authorize(Roles = "Admin")]
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