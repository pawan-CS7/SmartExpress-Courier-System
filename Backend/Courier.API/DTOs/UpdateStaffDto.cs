namespace Courier.API.DTOs
{
    public class UpdateStaffDto
    {
        public string Name { get; set; }
        public string Role { get; set; }

        public string? Nic { get; set; }
        public string? Address { get; set; }
        public string? MobileNo { get; set; }

        public int? BranchId { get; set; }

        public bool IsActive { get; set; }
    }
}
