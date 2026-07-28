namespace Courier.API.DTOs
{
    public class TrackingHistoryDto
    {
        public int Id { get; set; }
        public string? Status { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string? Remarks { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
