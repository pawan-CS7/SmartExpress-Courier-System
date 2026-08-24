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
    public class BranchesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BranchesController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<City> ResolveOrCreateCityAsync(int cityId, string? cityName, string? province, string? district, string? postalCode)
        {
            City? city = null;

            if (!string.IsNullOrWhiteSpace(cityName))
            {
                var targetName = cityName.Trim();
                city = await _context.Cities.FirstOrDefaultAsync(c => c.Name.ToLower() == targetName.ToLower());
                if (city == null)
                {
                    city = new City
                    {
                        Name = targetName,
                        Province = !string.IsNullOrWhiteSpace(province) ? province.Trim() : "Western Province",
                        District = !string.IsNullOrWhiteSpace(district) ? district.Trim() : "Colombo",
                        PostalCode = !string.IsNullOrWhiteSpace(postalCode) ? postalCode.Trim() : "00100",
                        IsActive = true,
                        CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
                    };
                    _context.Cities.Add(city);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    bool updated = false;
                    if (string.IsNullOrWhiteSpace(city.Province) && !string.IsNullOrWhiteSpace(province))
                    {
                        city.Province = province.Trim();
                        updated = true;
                    }
                    if (string.IsNullOrWhiteSpace(city.District) && !string.IsNullOrWhiteSpace(district))
                    {
                        city.District = district.Trim();
                        updated = true;
                    }
                    if (string.IsNullOrWhiteSpace(city.PostalCode) && !string.IsNullOrWhiteSpace(postalCode))
                    {
                        city.PostalCode = postalCode.Trim();
                        updated = true;
                    }
                    
                    if (updated)
                    {
                        await _context.SaveChangesAsync();
                    }
                }
            }

            if (city == null && cityId > 0)
            {
                city = await _context.Cities.FindAsync(cityId);
            }

            if (city == null)
            {
                var fallbackName = !string.IsNullOrWhiteSpace(cityName) ? cityName.Trim() : "Colombo";
                city = new City
                {
                    Name = fallbackName,
                    Province = !string.IsNullOrWhiteSpace(province) ? province.Trim() : "Western Province",
                    District = !string.IsNullOrWhiteSpace(district) ? district.Trim() : "Colombo",
                    PostalCode = !string.IsNullOrWhiteSpace(postalCode) ? postalCode.Trim() : "00100",
                    IsActive = true,
                    CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
                };
                _context.Cities.Add(city);
                await _context.SaveChangesAsync();
            }

            return city;
        }

        // GET: api/branches
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BranchDto>>> GetBranches([FromQuery] int? cityId, [FromQuery] bool? activeOnly)
        {
            // Auto-fix any legacy test city names (like "nupe") on existing branches
            var legacyNupeBranches = await _context.Branches.Include(b => b.City).Where(b => b.City != null && b.City.Name.ToLower() == "nupe").ToListAsync();
            if (legacyNupeBranches.Any())
            {
                foreach (var b in legacyNupeBranches)
                {
                    string inferredCityName = "Colombo";
                    if (b.Name.ToLower().Contains("colombo") || (b.Address != null && b.Address.ToLower().Contains("colombo"))) inferredCityName = "Colombo";
                    else if (b.Name.ToLower().Contains("waligama") || b.Name.ToLower().Contains("weligama") || (b.Address != null && b.Address.ToLower().Contains("weligama"))) inferredCityName = "Weligama";
                    else if (b.Name.ToLower().Contains("matara") || (b.Address != null && b.Address.ToLower().Contains("matara"))) inferredCityName = "Matara";

                    var targetCity = await _context.Cities.FirstOrDefaultAsync(c => c.Name.ToLower() == inferredCityName.ToLower());
                    if (targetCity == null)
                    {
                        targetCity = new City { 
                            Name = inferredCityName, 
                            Province = inferredCityName == "Colombo" ? "Western Province" : "Southern Province",
                            District = inferredCityName == "Colombo" ? "Colombo" : "Matara",
                            PostalCode = inferredCityName == "Colombo" ? "00100" : (inferredCityName == "Matara" ? "81000" : "81700"),
                            IsActive = true, 
                            CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime() 
                        };
                        _context.Cities.Add(targetCity);
                        await _context.SaveChangesAsync();
                    }

                    b.CityId = targetCity.Id;
                }
                await _context.SaveChangesAsync();
            }

            // Purge orphan test cities ("nupe", "walgama") from Cities table if not linked to any branches
            var testCitiesToPurge = await _context.Cities
                .Where(c => (c.Name.ToLower() == "nupe" || c.Name.ToLower() == "walgama") && !_context.Branches.Any(b => b.CityId == c.Id))
                .ToListAsync();

            if (testCitiesToPurge.Any())
            {
                _context.Cities.RemoveRange(testCitiesToPurge);
                await _context.SaveChangesAsync();
            }

            var query = _context.Branches.Include(b => b.City).AsQueryable();

            if (cityId.HasValue && cityId.Value > 0)
            {
                query = query.Where(b => b.CityId == cityId.Value);
            }

            if (activeOnly.HasValue && activeOnly.Value)
            {
                query = query.Where(b => b.IsActive);
            }

            var branches = await query
                .Select(b => new BranchDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    CityId = b.CityId,
                    CityName = b.City != null ? b.City.Name : null,
                    Address = b.Address,
                    ContactInfo = b.ContactInfo,
                    Latitude = b.Latitude,
                    Longitude = b.Longitude,
                    IsActive = b.IsActive,
                    IsSortingCenter = b.IsSortingCenter,

                    CreatedAt = b.CreatedAt
                })
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Ok(branches);
        }

        // GET: api/branches/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BranchDto>> GetBranch(int id)
        {
            var branch = await _context.Branches
                .Include(b => b.City)
                .Where(b => b.Id == id)
                .Select(b => new BranchDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    CityId = b.CityId,
                    CityName = b.City != null ? b.City.Name : null,
                    Address = b.Address,
                    ContactInfo = b.ContactInfo,
                    Latitude = b.Latitude,
                    Longitude = b.Longitude,
                    IsActive = b.IsActive,
                    IsSortingCenter = b.IsSortingCenter,

                    CreatedAt = b.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (branch == null)
            {
                return NotFound($"Branch with ID {id} not found.");
            }

            return Ok(branch);
        }

        // POST: api/branches
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<BranchDto>> CreateBranch(CreateBranchRequest dto)
        {
            var city = await ResolveOrCreateCityAsync(dto.CityId, dto.CityName, dto.Province, dto.District, dto.PostalCode);

            var branch = new Branch
            {
                Name = dto.Name.Trim(),
                CityId = city.Id,
                Address = dto.Address?.Trim(),
                ContactInfo = dto.ContactInfo?.Trim(),
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                IsActive = dto.IsActive,
                IsSortingCenter = dto.IsSortingCenter,

                CreatedAt = Courier.API.Utils.TimeUtil.GetSriLankaTime()
            };

            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();

            var result = new BranchDto
            {
                Id = branch.Id,
                Name = branch.Name,
                CityId = branch.CityId,
                CityName = city.Name,
                Address = branch.Address,
                ContactInfo = branch.ContactInfo,
                Latitude = branch.Latitude,
                Longitude = branch.Longitude,
                IsActive = branch.IsActive,
                IsSortingCenter = branch.IsSortingCenter,

                CreatedAt = branch.CreatedAt
            };

            return CreatedAtAction(nameof(GetBranch), new { id = branch.Id }, result);
        }

        // PUT: api/branches/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBranch(int id, UpdateBranchRequest dto)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch == null)
            {
                return NotFound($"Branch with ID {id} not found.");
            }

            var city = await ResolveOrCreateCityAsync(dto.CityId, dto.CityName, dto.Province, dto.District, dto.PostalCode);

            branch.Name = dto.Name.Trim();
            branch.CityId = city.Id;
            branch.Address = dto.Address?.Trim();
            branch.ContactInfo = dto.ContactInfo?.Trim();
            branch.Latitude = dto.Latitude;
            branch.Longitude = dto.Longitude;
            branch.IsActive = dto.IsActive;
            branch.IsSortingCenter = dto.IsSortingCenter;


            await _context.SaveChangesAsync();

            return Ok(new BranchDto
            {
                Id = branch.Id,
                Name = branch.Name,
                CityId = branch.CityId,
                CityName = city.Name,
                Address = branch.Address,
                ContactInfo = branch.ContactInfo,
                Latitude = branch.Latitude,
                Longitude = branch.Longitude,
                IsActive = branch.IsActive,
                IsSortingCenter = branch.IsSortingCenter,

                CreatedAt = branch.CreatedAt
            });
        }

        // DELETE: api/branches/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBranch(int id)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch == null)
            {
                return NotFound($"Branch with ID {id} not found.");
            }

            _context.Branches.Remove(branch);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Branch deleted successfully." });
        }
    }
}
