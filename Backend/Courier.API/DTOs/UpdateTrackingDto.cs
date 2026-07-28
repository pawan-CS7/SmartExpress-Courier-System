using System.ComponentModel.DataAnnotations;

namespace Courier.API.DTOs
{
    public class UpdateTrackingDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string? Remarks { get; set; }
    }
}
