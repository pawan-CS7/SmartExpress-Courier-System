namespace Courier.API.DTOs
{
    public class RegisterUserDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string NIC { get; set; }
        public string Address { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }

        public int? BranchId { get; set; }
        public int? ClientId { get; set; }
    }
}
