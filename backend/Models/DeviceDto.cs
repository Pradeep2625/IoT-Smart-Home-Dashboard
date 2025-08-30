// Models/DeviceDto.cs

using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class DeviceDto
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Type { get; set; }
    }
}