using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class DeviceDto
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Type { get; set; }

        public bool Status { get; set; }

        public double? Temperature { get; set; }  // Allow frontend to set temperature
        public bool? IsArmed { get; set; }        // Optional
    }
}
