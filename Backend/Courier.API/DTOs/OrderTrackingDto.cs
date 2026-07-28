namespace Courier.API.DTOs
{
    public class OrderTrackingDto
    {
        public int OrderId { get; set; }
        public string? WaybillId { get; set; }
        public string? OrderNo { get; set; }
        public string? CustomerName { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<TrackingHistoryDto> History { get; set; } = new();
    }
}
