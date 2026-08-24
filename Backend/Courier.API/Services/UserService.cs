using Courier.API.DTOs;
using Courier.API.Entities;

namespace Courier.API.Services
{
    public class UserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User> CreateUserAsync(RegisterUserDto dto)
        {
            var hashedPassword = global::BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var roleToAssign = dto.Role;
            if (dto.BranchId.HasValue && (roleToAssign == "BranchManager" || roleToAssign == "Manager"))
            {
                var branch = await _context.Branches.FindAsync(dto.BranchId.Value);
                if (branch != null && branch.IsSortingCenter)
                {
                    roleToAssign = "SortingCenterManager";
                }
            }

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                NIC = dto.NIC,
                Address = dto.Address,
                PasswordHash = hashedPassword,
                Role = roleToAssign,
                BranchId = dto.BranchId,
                ClientId = dto.ClientId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }
    }
}