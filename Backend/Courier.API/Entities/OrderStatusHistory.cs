namespace Courier.API.Entities
{
    public class OrderStatusHistory
    {
        public int Id { get; set; }
        public int? OrderId { get; set; }
        public string? Status { get; set; }
        public string? Location { get; set; }
        public string? Remarks { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
