using System;
using System.ComponentModel.DataAnnotations;

namespace Courier.API.DTOs
{
    public class CityDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? PostalCode { get; set; }
        public bool IsActive { get; set; }
        public int BranchCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCityDto
    {
        [Required(ErrorMessage = "City name is required")]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Province { get; set; }

        [MaxLength(100)]
        public string? District { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class UpdateCityDto
    {
        [Required(ErrorMessage = "City name is required")]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Province { get; set; }

        [MaxLength(100)]
        public string? District { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
