using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using backend.Hubs;
using backend.Models;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
namespace backend.Services
{
    public class IoTSimulatorService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private Timer _timer;

        public IoTSimulatorService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _timer = new Timer(GenerateMockData, null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
            await Task.CompletedTask; // No async work in constructor
        }

        private async void GenerateMockData(object? state)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SensorHub>>();
                var sensorService = scope.ServiceProvider.GetRequiredService<ISensorService>();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var deviceId = 1;
                var device = await context.Devices.FindAsync(deviceId);
                if (device == null) return;

                var temp = new Random().NextDouble() * 100;
                var hum = new Random().Next(0, 100);
                var power = new Random().Next(0, 300);
                var security = new Random().Next(0, 10) > 7 ? "Motion detected" : "None";

                await sensorService.SaveSensorReading(new SensorReading
                {
                    DeviceId = deviceId,
                    Type = "temperature",
                    Value = temp.ToString(),
                    Device = device
                });
                await sensorService.SaveSensorReading(new SensorReading
                {
                    DeviceId = deviceId,
                    Type = "humidity",
                    Value = hum.ToString(),
                    Device = device
                });
                await sensorService.SaveSensorReading(new SensorReading
                {
                    DeviceId = deviceId,
                    Type = "powerUsage",
                    Value = power.ToString(),
                    Device = device
                });
                await sensorService.SaveSensorReading(new SensorReading
                {
                    DeviceId = deviceId,
                    Type = "securityAlert",
                    Value = security,
                    Device = device
                });

                var data = new SensorData { Temperature = temp, Humidity = hum, PowerUsage = power, SecurityAlert = security };
                await hubContext.Clients.All.SendAsync("ReceiveSensorData", deviceId, data);

                if (temp > 80 || hum > 70 || power > 200 || security != "None")
                {
                    var alertType = temp > 80 ? "tempChange" : (power > 200 ? "powerSurge" : "securityBreach");
                    var message = $"Alert: {alertType} detected! Temp: {temp}, Power: {power}, Security: {security}";
                    var alert = new Alert
                    {
                        DeviceId = deviceId,
                        Type = alertType,
                        Message = message,
                        Device = device
                    };
                    await sensorService.TriggerAlert(alert);
                    await hubContext.Clients.All.SendAsync("ReceiveAlert", alert);
                }
            }
        }
    }
}