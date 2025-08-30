

using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public interface IControlService
    {
        Task SetDeviceArmedStatus(int deviceId, bool isArmed, int userId);
    }

    public class ControlService : IControlService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ControlService> _logger;

        public ControlService(ApplicationDbContext context, ILogger<ControlService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SetDeviceArmedStatus(int deviceId, bool isArmed, int userId)
        {
            var device = await _context.Devices
                .FirstOrDefaultAsync(d => d.Id == deviceId && d.UserId == userId);

            if (device == null)
            {
                _logger.LogWarning("Attempt to toggle armed status for non-existent or unauthorized device {DeviceId} by user {UserId}", deviceId, userId);
                throw new UnauthorizedAccessException("Device not found or user is not the owner.");
            }

            device.Status = isArmed;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Device {DeviceId} armed status set to {IsArmed}", deviceId, isArmed);
        }
    }
}