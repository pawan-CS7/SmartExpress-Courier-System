using System;

namespace Courier.API.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int? TargetId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
