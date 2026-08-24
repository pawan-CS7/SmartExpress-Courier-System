namespace Courier.API.Entities
{
    public class WaybillRequest
    {
        public int Id { get; set; }

        public int ClientId { get; set; }

        public int NoOfWaybills { get; set; }

        public int NoOfBarcodes { get; set; }

        public string? FromBarcode { get; set; }

        public string? ToBarcode { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, Done

        public DateTime RequestedDate { get; set; } = Courier.API.Utils.TimeUtil.GetSriLankaTime();

        public DateTime? ConfirmDate { get; set; }
    }
}
