using Courier.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace Courier.API
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }

        public DbSet<WaybillRequest> WaybillRequests { get; set; }

        public DbSet<Waybill> Waybills { get; set; }

        public DbSet<WaybillSequence> WaybillSequences { get; set; }
    }
}
