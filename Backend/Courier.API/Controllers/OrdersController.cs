using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Courier.API.Entities;
using Courier.API.DTOs;
using System.Security.Claims;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

namespace Courier.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            var orders = await _context.Orders
                                .Include(o => o.Client)
                                .OrderByDescending(o => o.CreatedAt)
                                .ToListAsync();

            return Ok(orders);
        }

        [Authorize(Roles = "Client")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdString = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || user.ClientId == null) return Unauthorized();

            var orders = await _context.Orders
                .Include(o => o.Client)
                .Where(o => o.ClientId == user.ClientId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [Authorize(Roles = "Client")]
        [HttpGet("processing")]
        public async Task<IActionResult> GetProcessingOrders()
        {
            var userIdString = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || user.ClientId == null) return Unauthorized();

            var orders = await _context.Orders
                .Where(o => o.ClientId == user.ClientId && (o.Status == "Processing" || o.Status == "Pending" || o.Status == "Out"))
                .Select(o => new {
                    o.Id,
                    TrackingNo = o.OrderNo,
                    ReceiverName = o.CustomerName,
                    o.Status,
                    ExpectedDate = o.CreatedAt != null ? o.CreatedAt.Value.AddDays(2) : (DateTime?)null
                })
                .OrderByDescending(o => o.Id)
                .ToListAsync();

            return Ok(orders);
        }

        [Authorize(Roles = "Client")]
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            try 
            {
                var userIdString = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdString)) return Unauthorized(new { message = "Token missing userId claim." });

                var user = await _context.Users.FindAsync(int.Parse(userIdString));
                if (user == null) return Unauthorized(new { message = "User not found in database." });
                if (user.ClientId == null) return Unauthorized(new { message = "User is not mapped to a Client." });

                // Check if Waybill belongs to this client and is valid
                var waybill = await _context.Waybills
                    .FirstOrDefaultAsync(w => w.Barcode == dto.WaybillId && w.ClientId == user.ClientId);

                if (waybill == null) 
                {
                    return BadRequest(new { message = $"Invalid or unassigned barcode. Provided barcode: {dto.WaybillId}, ClientId: {user.ClientId}" });
                }

                if (waybill.IsUsed == true)
                {
                    return BadRequest(new { message = "This barcode has already been used." });
                }

                var order = new Order
                {
                    WaybillId = dto.WaybillId,
                    OrderNo = $"TRK-{DateTime.Now.Ticks.ToString().Substring(8, 6)}",
                    ClientId = user.ClientId,
                    CustomerName = dto.CustomerName,
                    Phone1 = dto.Phone1,
                    Address = dto.Address,
                    CODAmount = dto.CODAmount,
                    Status = "Pending",
                    Remarks = dto.Weight, // Store weight in remarks for now
                    CreatedAt = DateTime.UtcNow
                };

                _context.Orders.Add(order);
                
                // Mark waybill as used
                waybill.IsUsed = true;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Order created successfully", orderNo = order.OrderNo });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Server error: {ex.Message}. Inner: {ex.InnerException?.Message}" });
            }
        }

        [Authorize(Roles = "Client")]
        [HttpPost("bulk")]
        public async Task<IActionResult> BulkCreateOrder(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });

            var userIdString = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || user.ClientId == null) return Unauthorized(new { message = "User is not mapped to a Client." });

            var records = new List<OrderCreateDto>();
            try
            {
                using (var stream = file.OpenReadStream())
                using (var reader = new StreamReader(stream))
                using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture) { 
                    HasHeaderRecord = true,
                    HeaderValidated = null,
                    MissingFieldFound = null,
                    PrepareHeaderForMatch = args => args.Header.Trim().ToLower()
                }))
                {
                    records = csv.GetRecords<OrderCreateDto>().ToList();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error reading CSV format. Ensure headers are correct: CustomerName, Phone1, Address, Weight, CODAmount. Error: {ex.Message}" });
            }

            if (!records.Any()) return BadRequest(new { message = "The uploaded file contains no data." });

            int clientId = user.ClientId ?? 0;

            // Fetch available barcodes
            var availableWaybills = await _context.Waybills
                .Where(w => w.ClientId == clientId && w.IsUsed == false)
                .OrderBy(w => w.Id)
                .ToListAsync();

            if (availableWaybills.Count < records.Count)
            {
                return BadRequest(new { message = $"Not enough available barcodes. You have {availableWaybills.Count} available barcodes, but you are trying to create {records.Count} orders. Please request more Waybills." });
            }

            var orders = new List<Order>();
            
            for (int i = 0; i < records.Count; i++)
            {
                var record = records[i];
                var waybill = availableWaybills[i];

                var order = new Order
                {
                    WaybillId = waybill.Barcode,
                    OrderNo = $"TRK-{DateTime.Now.Ticks.ToString().Substring(8, 6)}-{i}", 
                    ClientId = user.ClientId,
                    CustomerName = record.CustomerName,
                    Phone1 = record.Phone1,
                    Address = record.Address,
                    CODAmount = record.CODAmount,
                    Status = "Pending",
                    Remarks = record.Weight,
                    CreatedAt = DateTime.UtcNow
                };

                orders.Add(order);
                waybill.IsUsed = true;
            }

            _context.Orders.AddRange(orders);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Successfully created {orders.Count} orders automatically mapped with your available barcodes." });
        }

        [Authorize(Roles = "Client")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderUpdateDto dto)
        {
            var userIdString = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userIdString));
            if (user == null || user.ClientId == null) return Unauthorized(new { message = "User is not mapped to a Client." });

            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id && o.ClientId == user.ClientId);
            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            if (order.Status != "Pending")
            {
                return BadRequest(new { message = $"Order cannot be edited because its current status is '{order.Status}'. Only 'Pending' orders can be modified." });
            }

            if (!string.IsNullOrWhiteSpace(dto.CustomerName)) order.CustomerName = dto.CustomerName;
            if (!string.IsNullOrWhiteSpace(dto.Phone1)) order.Phone1 = dto.Phone1;
            if (!string.IsNullOrWhiteSpace(dto.Phone2)) order.Phone2 = dto.Phone2;
            if (!string.IsNullOrWhiteSpace(dto.Address)) order.Address = dto.Address;
            if (dto.CityId.HasValue) order.CityId = dto.CityId;
            if (dto.CODAmount.HasValue) order.CODAmount = dto.CODAmount.Value;
            if (!string.IsNullOrWhiteSpace(dto.Weight)) order.Remarks = dto.Weight;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order updated successfully.", order });
        }
    }
}