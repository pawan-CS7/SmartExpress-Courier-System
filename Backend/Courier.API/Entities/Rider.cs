using System;
using System.ComponentModel.DataAnnotations;

namespace Courier.API.Entities
{
    public class Rider
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string RiderId { get; set; } = string.Empty; // Unique rider ID, e.g., R01

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Phone { get; set; } = string.Empty;

        public int BranchId { get; set; }

        public Branch? Branch { get; set; }

        public int? UserId { get; set; }
        public User? User { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = Courier.API.Utils.TimeUtil.GetSriLankaTime();
    }
}
