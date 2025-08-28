using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using backend.Models;
namespace backend.Hubs
{
    [Authorize]
    public class SensorHub : Hub
    {
        public async Task SendSensorData(int deviceId, object data)
        {
            await Clients.All.SendAsync("ReceiveSensorData", deviceId, data);
        }

        public async Task SendAlert(Alert alert)
        {
            await Clients.All.SendAsync("ReceiveAlert", alert);
        }
    }
}