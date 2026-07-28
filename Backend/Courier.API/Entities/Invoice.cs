namespace Courier.API.Entities
{
    public class Invoice
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public decimal TotalCOD { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal DeliveryCharges { get; set; }
        public decimal CommissionPercentage { get; set; }
        public decimal TotalCommission { get; set; }
        public decimal FinalAmount { get; set; }
        public decimal SetoffAmount { get; set; }
        public string? Status { get; set; }
    }
}
