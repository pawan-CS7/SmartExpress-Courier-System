using System;
using System.ComponentModel.DataAnnotations;

namespace Courier.API.DTOs
{
    public class BranchDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CityId { get; set; }
        public string? CityName { get; set; }
        public string? Address { get; set; }
        public string? ContactInfo { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsActive { get; set; }
        public bool IsSortingCenter { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateBranchRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public int CityId { get; set; }
        public string? CityName { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? PostalCode { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? ContactInfo { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsSortingCenter { get; set; } = false;
    }

    public class UpdateBranchRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public int CityId { get; set; }
        public string? CityName { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }
        public string? PostalCode { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? ContactInfo { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public bool IsActive { get; set; }
        public bool IsSortingCenter { get; set; }
    }
}
