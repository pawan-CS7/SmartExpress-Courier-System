namespace Courier.API.Entities
{
    public class Order
    {
        public int Id { get; set; }
        public string? TrackingNumber { get; set; }
        public int? ClientId { get; set; }
        public Client? Client { get; set; }
        public string? CustomerName { get; set; }
        public string? Address { get; set; }
        public string? Phone1 { get; set; }
        public string? Phone2 { get; set; }
        public int? CityId { get; set; }
        public int? DistrictId { get; set; }
        public decimal? CODAmount { get; set; }
        public decimal? DeliveryCharge { get; set; }
        public string? Description { get; set; }
        public string? Remarks { get; set; }
        public int? PickupBranchId { get; set; }
        public int? OriginBranchId { get; set; }
        public int? DestinationBranchId { get; set; }
        public int? TempBranchId { get; set; }
        public int? CurrentBranchId { get; set; }
        public int? AssignedRiderId { get; set; }
        public string? Status { get; set; }
        public int? DeliveryAttempt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? StatusChangedAt { get; set; }
    }
}
