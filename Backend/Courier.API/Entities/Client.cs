namespace Courier.API.Entities
{
    public class Client
    {
        public int Id { get; set; }
        public string? BusinessName { get; set; }
        public string? OwnerName { get; set; }
        public string? NIC { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? BusinessRegistrationNo { get; set; }
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public int? BranchId { get; set; }
        public string? PickupAddress { get; set; }
        public int? NearestCityId { get; set; }
        public string? PaymentTerms { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
