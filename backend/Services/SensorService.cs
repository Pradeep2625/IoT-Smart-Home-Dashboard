using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;
using backend.Hubs;
using Microsoft.AspNetCore.SignalR;
namespace backend.Services
{
    public class SensorService : ISensorService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMailService _mailService;
        private readonly IHubContext<SensorHub> _hubContext;

        public SensorService(ApplicationDbContext context, IMailService mailService, IHubContext<SensorHub> hubContext)
        {
            _context = context;
            _mailService = mailService;
            _hubContext = hubContext;
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

        // Services/SensorService.cs
        public async Task TriggerAlert(Alert alert)
        {
            _context.Alerts.Add(alert);
            await _context.SaveChangesAsync();

            // Fetch device and owner
            var device = await _context.Devices
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == alert.DeviceId);

            if (device?.UserId != null)
            {
                // Send only to this user’s group; matches hub OnConnectedAsync group name
                await _hubContext.Clients
                    .Group($"user:{device.UserId}")
                    .SendAsync("ReceiveAlert", new
                    {
                        id = alert.Id,
                        type = alert.Type,
                        message = alert.Message,
                        timestamp = alert.Timestamp
                    });
            }
            // Optional email remains unchanged
            if (device?.User?.Email != null)
            {
                var mail = new MailData
                {
                    EmailToId = device.User.Email,
                    EmailToName = device.User.Username,
                    EmailSubject = $"Smart Home Alert: {alert.Type}",
                    EmailBody = $"<p>{alert.Message}</p><p>Time (UTC): {alert.Timestamp}</p>"
                };
                await _mailService.SendMailAsync(mail);
            }
        }

    }
}
