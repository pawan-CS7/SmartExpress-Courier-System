namespace Courier.API.DTOs
{
    public class OrderUpdateDto
    {
        public string? CustomerName { get; set; }
        public string? Phone1 { get; set; }
        public string? Phone2 { get; set; }
        public string? Address { get; set; }
        public int? CityId { get; set; }
        public decimal? CODAmount { get; set; }
        public string? Weight { get; set; }
    }
}
