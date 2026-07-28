namespace Courier.API.DTOs
{
    public class OrderCreateDto
    {
        public string? CustomerName { get; set; }
        public string? Phone1 { get; set; }
        public string? Address { get; set; }
        public string? Weight { get; set; } // Currently UI has Weight string/input
        public decimal? CODAmount { get; set; }
        public string? WaybillId { get; set; }
    }
}
