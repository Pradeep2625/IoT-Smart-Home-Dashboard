// Hubs/SensorHub.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace backend.Hubs
{
    [Authorize]
    public class SensorHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}"); // auto rejoin on reconnect [1]
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? ex)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user:{userId}"); // cleanup on disconnect [1]
            await base.OnDisconnectedAsync(ex);
        }

        // Optional: server-to-all telemetry; keep if needed for public dashboards
        public async Task SendSensorData(int deviceId, object data) =>
          await Clients.All.SendAsync("ReceiveSensorData", deviceId, data); // public stream if desired [2]

        // Optional: manual alert broadcast (prefer group send from services/controllers)
        public async Task SendAlert(object alert) =>
          await Clients.All.SendAsync("ReceiveAlert", alert); // legacy broadcast, not used for private alerts [2]
    }
}
