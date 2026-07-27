namespace Courier.API.Entities
{
    public class Waybill
    {
        public int Id { get; set; }

        public string Barcode { get; set; }

        public bool IsUsed { get; set; } = false;

        public int ClientId { get; set; }

        public int WaybillRequestId { get; set; }
    }
}
