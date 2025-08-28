using Microsoft.EntityFrameworkCore;
using backend.Models;
namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<SensorReading> SensorReadings { get; set; }
        public DbSet<Alert> Alerts { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = "hashedpassword"
            });
            modelBuilder.Entity<Device>().HasData(new Device
            {
                Id = 1,
                Name = "Living Room Thermostat",
                Type = "thermostat",
                UserId = 1,
                Status = false
            });
        }
    }
}