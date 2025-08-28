using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;
namespace backend.Services
{
    public class SensorService : ISensorService
    {
        private readonly ApplicationDbContext _context;

        public SensorService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SensorData> GetLatestSensorData(int deviceId)
        {
            var readings = await _context.SensorReadings
                .Where(r => r.DeviceId == deviceId)
                .OrderByDescending(r => r.Timestamp)
                .Take(4)
                .ToListAsync();

            return new SensorData
            {
                Temperature = double.TryParse(readings.FirstOrDefault(r => r.Type == "temperature")?.Value, out var temp) ? temp : 0,
                Humidity = int.TryParse(readings.FirstOrDefault(r => r.Type == "humidity")?.Value, out var hum) ? hum : 0,
                PowerUsage = int.TryParse(readings.FirstOrDefault(r => r.Type == "powerUsage")?.Value, out var power) ? power : 0,
                SecurityAlert = readings.FirstOrDefault(r => r.Type == "securityAlert")?.Value ?? "None"
            };
        }

        public async Task SaveSensorReading(SensorReading reading)
        {
            _context.SensorReadings.Add(reading);
            await _context.SaveChangesAsync();
        }

        public async Task TriggerAlert(Alert alert)
        {
            _context.Alerts.Add(alert);
            await _context.SaveChangesAsync();
        }
    }
}