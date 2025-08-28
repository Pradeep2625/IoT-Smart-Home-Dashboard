using System;
using System.ComponentModel.DataAnnotations;
namespace backend.Models
{
    public class Device
    {
        [Key] public int Id { get; set; }
        [Required] public required string Name { get; set; }
        [Required] public required string Type { get; set; }
        public int UserId { get; set; }
        public bool Status { get; set; }
        public User User { get; set; } // Use 'required'
        public ICollection<SensorReading> SensorReadings { get; set; }
        public ICollection<Alert> Alerts { get; set; }
    }
}
