namespace Courier.API.DTOs
{
    public class CreateStaffDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        public string Role { get; set; } // Admin, Manager, Rider

        public string? Nic { get; set; }
        public string? Address { get; set; }
        public string? MobileNo { get; set; }

        public int? BranchId { get; set; }
    }
}
