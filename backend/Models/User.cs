using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        // Use 'required' instead of nullable for required username
        [Required]
        public required string Username { get; set; }

        [Required]
        public required string Email { get; set; }

        // Nullable password hash (set during registration)
        public string? PasswordHash { get; set; }

        // Optional role
        public string? Role { get; set; }

        // Initialize Devices collection to avoid CS8618
        public virtual ICollection<Device> Devices { get; set; } = new List<Device>();
    }
}