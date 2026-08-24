namespace Courier.API.Entities
{
    public class User
    {
        public int Id { get; set; }

        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string NIC { get; set; }
        public string Address { get; set; }

        public string PasswordHash { get; set; }

        public string Role { get; set; }

        public int? BranchId { get; set; }
        public int? ClientId { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = Courier.API.Utils.TimeUtil.GetSriLankaTime();

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }

        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }
    }
}
