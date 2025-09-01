using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Device
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public required string Name { get; set; }

        [Required]
        public required string Type { get; set; }

        public int UserId { get; set; }

        public bool Status { get; set; }

        public virtual User? User { get; set; }

        public virtual ICollection<SensorReading> SensorReadings { get; set; } = new List<SensorReading>();

        public virtual ICollection<Alert> Alerts { get; set; } = new List<Alert>();
    }
}
