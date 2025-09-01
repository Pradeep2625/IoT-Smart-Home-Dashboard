using backend.Models;
using backend.Data;
namespace backend.Services
{
    public class ControlService : IControlService
    {
        private readonly ApplicationDbContext _context;

        public ControlService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task UpdateDeviceStatus(int deviceId, bool status)
        {
            var device = await _context.Devices.FindAsync(deviceId);
            if (device != null)
            {
                device.Status = status;
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateThermostatValue(int deviceId, double value)
        {
            var device = await _context.Devices.FindAsync(deviceId);
            if (device != null && device.Type == "thermostat")
            {
                _context.SensorReadings.Add(new SensorReading
                {
                    DeviceId = deviceId,
                    Type = "temperature",                // required field
                    Value = value.ToString(),            // convert double → string
                    Timestamp = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
            }
        }


        public async Task ToggleDoorStatus(int deviceId, bool status)
        {
            await UpdateDeviceStatus(deviceId, status);
        }

        public async Task ToggleArmedStatus(int deviceId, bool status)
        {
            await UpdateDeviceStatus(deviceId, status);
        }
    }
}
