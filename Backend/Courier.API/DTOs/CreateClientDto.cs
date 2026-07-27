namespace Courier.API.DTOs
{
    public class CreateClientDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? MobileNo { get; set; }
        public string? Address { get; set; }
        public string NIC { get; set; }
    }
}
