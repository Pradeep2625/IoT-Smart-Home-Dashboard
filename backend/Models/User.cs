using System;
using System.ComponentModel.DataAnnotations;
namespace backend.Models
{
    public class User
    {
        [Key] public int Id { get; set; }
        [Required] public required string Username { get; set; } // Use 'required' instead of nullable
        [Required] public required string Email { get; set; }
        [Required] public required string PasswordHash { get; set; }
        public string? Role { get; set; } // Nullable
        public ICollection<Device> Devices { get; set; } // Use 'required' for collections
    }
}