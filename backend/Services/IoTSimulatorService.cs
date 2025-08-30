using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using backend.Hubs;
using backend.Models;
using backend.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;


namespace backend.Services
{
    public class IoTSimulatorService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private Timer? _timer;
        private readonly Random _random = new Random();

        public IoTSimulatorService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Run GenerateMockData every 5 seconds
            _timer = new Timer(async _ => await GenerateMockData(), null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
            return Task.CompletedTask;
        }

        private async Task GenerateMockData()
        {
            using var scope = _serviceProvider.CreateScope();

            var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SensorHub>>();
            var sensorService = scope.ServiceProvider.GetRequiredService<ISensorService>();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // For demo, just pick first device
            var device = await context.Devices.FirstOrDefaultAsync();
            if (device == null) return;

            var temp = _random.NextDouble() * 100;
            var hum = _random.Next(0, 100);
            var power = _random.Next(0, 300);
            var security = _random.Next(0, 10) > 7 ? "Motion detected" : "None";

            // Save readings
            await sensorService.SaveSensorReading(new SensorReading { DeviceId = device.Id, Type = "temperature", Value = temp.ToString(), Device = device });
            await sensorService.SaveSensorReading(new SensorReading { DeviceId = device.Id, Type = "humidity", Value = hum.ToString(), Device = device });
            await sensorService.SaveSensorReading(new SensorReading { DeviceId = device.Id, Type = "powerUsage", Value = power.ToString(), Device = device });
            await sensorService.SaveSensorReading(new SensorReading { DeviceId = device.Id, Type = "securityAlert", Value = security, Device = device });

            // Broadcast new data
            var data = new SensorData { Temperature = temp, Humidity = hum, PowerUsage = power, SecurityAlert = security };
            await hubContext.Clients.All.SendAsync("ReceiveSensorData", device.Id, data);

            // Generate alerts
            if (temp > 80 || hum > 70 || power > 200 || security != "None")
            {
                var alertType = temp > 80 ? "tempChange" : (power > 200 ? "powerSurge" : "securityBreach");
                var message = $"Alert: {alertType} detected! Temp: {temp}, Power: {power}, Security: {security}";
                var alert = new Alert { DeviceId = device.Id, Type = alertType, Message = message, Device = device };

                await sensorService.TriggerAlert(alert);
                await hubContext.Clients.All.SendAsync("ReceiveAlert", alert);
            }
        }

        public override Task StopAsync(CancellationToken stoppingToken)
        {
            _timer?.Dispose();
            return base.StopAsync(stoppingToken);
        }
    }
}
