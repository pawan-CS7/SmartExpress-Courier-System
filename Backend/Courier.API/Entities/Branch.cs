using System;
using System.ComponentModel.DataAnnotations;

namespace Courier.API.Entities
{
    public class Branch
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public int CityId { get; set; }

        public City? City { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? ContactInfo { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(7)]
        public string? Color { get; set; }

        public bool IsSortingCenter { get; set; } = false;

        public DateTime CreatedAt { get; set; } = Courier.API.Utils.TimeUtil.GetSriLankaTime();
    }
}
