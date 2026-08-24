using Courier.API.DTOs;
using Courier.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Courier.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CitiesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CitiesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/cities
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CityDto>>> GetCities([FromQuery] bool? activeOnly)
        {
            var query = _context.Cities.AsQueryable();

            if (activeOnly.HasValue && activeOnly.Value)
            {
                query = query.Where(c => c.IsActive);
            }

            var cities = await query
                .Select(c => new CityDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Province = c.Province,
                    District = c.District,
                    PostalCode = c.PostalCode,
                    IsActive = c.IsActive,
                    BranchCount = c.Branches.Count,
                    CreatedAt = c.CreatedAt
                })
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(cities);
        }

        // GET: api/cities/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CityDto>> GetCity(int id)
        {
            var city = await _context.Cities
                .Where(c => c.Id == id)
                .Select(c => new CityDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Province = c.Province,
                    District = c.District,
                    PostalCode = c.PostalCode,
                    IsActive = c.IsActive,
                    BranchCount = c.Branches.Count,
                    CreatedAt = c.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (city == null)
            {
                return NotFound($"City with ID {id} not found.");
            }

            return Ok(city);
        }

        // POST: api/cities
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CityDto>> CreateCity([FromBody] CreateCityDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("City name is required.");
            }

            var trimmedName = dto.Name.Trim();
            var trimmedDistrict = dto.District?.Trim();

            // Check if city name already exists within the same district (or overall)
            var duplicateExists = await _context.Cities.AnyAsync(c =>
                c.Name.ToLower() == trimmedName.ToLower() &&
                (string.IsNullOrEmpty(trimmedDistrict) || (c.District != null && c.District.ToLower() == trimmedDistrict.ToLower())));

            if (duplicateExists)
            {
                return BadRequest($"City '{trimmedName}' already exists in this district.");
            }

            var city = new City
            {
                Name = trimmedName,
                Province = dto.Province?.Trim(),
                District = trimmedDistrict,
                PostalCode = dto.PostalCode?.Trim(),
                IsActive = dto.IsActive,
                CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
            };

            _context.Cities.Add(city);
            await _context.SaveChangesAsync();

            var result = new CityDto
            {
                Id = city.Id,
                Name = city.Name,
                Province = city.Province,
                District = city.District,
                PostalCode = city.PostalCode,
                IsActive = city.IsActive,
                BranchCount = 0,
                CreatedAt = city.CreatedAt
            };

            return CreatedAtAction(nameof(GetCity), new { id = city.Id }, result);
        }

        // PUT: api/cities/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCity(int id, [FromBody] UpdateCityDto dto)
        {
            var city = await _context.Cities.FindAsync(id);
            if (city == null)
            {
                return NotFound($"City with ID {id} not found.");
            }

            var trimmedName = dto.Name.Trim();
            var trimmedDistrict = dto.District?.Trim();

            var duplicateExists = await _context.Cities.AnyAsync(c =>
                c.Id != id &&
                c.Name.ToLower() == trimmedName.ToLower() &&
                (string.IsNullOrEmpty(trimmedDistrict) || (c.District != null && c.District.ToLower() == trimmedDistrict.ToLower())));

            if (duplicateExists)
            {
                return BadRequest($"Another city named '{trimmedName}' already exists in this district.");
            }

            city.Name = trimmedName;
            city.Province = dto.Province?.Trim();
            city.District = trimmedDistrict;
            city.PostalCode = dto.PostalCode?.Trim();
            city.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new CityDto
            {
                Id = city.Id,
                Name = city.Name,
                Province = city.Province,
                District = city.District,
                PostalCode = city.PostalCode,
                IsActive = city.IsActive,
                BranchCount = await _context.Branches.CountAsync(b => b.CityId == city.Id),
                CreatedAt = city.CreatedAt
            });
        }

        // DELETE: api/cities/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCity(int id)
        {
            var city = await _context.Cities.Include(c => c.Branches).FirstOrDefaultAsync(c => c.Id == id);
            if (city == null)
            {
                return NotFound($"City with ID {id} not found.");
            }

            if (city.Branches.Any())
            {
                city.IsActive = false;
                await _context.SaveChangesAsync();
                return Ok(new { message = "City has linked branches and was deactivated instead of deleted." });
            }

            _context.Cities.Remove(city);
            await _context.SaveChangesAsync();

            return Ok(new { message = "City deleted successfully." });
        }
    }
}
