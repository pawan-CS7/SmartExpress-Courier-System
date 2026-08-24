using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Courier.API.Entities
{
    public class City
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Province { get; set; }

        [MaxLength(100)]
        public string? District { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = Courier.API.Utils.TimeUtil.GetSriLankaTime();

        // Navigation property for related branches
        public ICollection<Branch> Branches { get; set; } = new List<Branch>();
    }
}
