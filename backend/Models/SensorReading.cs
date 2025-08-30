using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class SensorReading
    {
        [Key]
        public int Id { get; set; }

        public int DeviceId { get; set; }

        [Required]
        public required string Type { get; set; }

        [Required]
        public required string Value { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Nullable navigation property to avoid CS8618
        public virtual Device? Device { get; set; }
    }
}