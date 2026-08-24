using Courier.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace Courier.API
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<WaybillRequest> WaybillRequests { get; set; }
        public DbSet<Waybill> Waybills { get; set; }
        public DbSet<WaybillSequence> WaybillSequences { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderStatusHistory> OrderStatusHistory { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<TrackingPrefixState> TrackingPrefixStates { get; set; }
        public DbSet<Rider> Riders { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Order>()
                .HasIndex(o => o.TrackingNumber)
                .IsUnique();
                
            modelBuilder.Entity<Rider>()
                .HasIndex(r => r.RiderId)
                .IsUnique();
        }
    }
}
