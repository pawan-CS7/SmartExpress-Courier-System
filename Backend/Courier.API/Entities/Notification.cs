using System;
using System.ComponentModel.DataAnnotations;

namespace Courier.API.Entities
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public int? TargetId { get; set; }

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; } = Courier.API.Utils.TimeUtil.GetSriLankaTime();
    }
}
