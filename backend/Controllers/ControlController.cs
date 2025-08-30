using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using backend.Hubs;
using System.Security.Claims;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/control")]
    [Authorize]
    public class ControlController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<SensorHub> _hub;
        private readonly IControlService _controlService;

        // Unified constructor
        public ControlController(ApplicationDbContext context, IHubContext<SensorHub> hub, IControlService controlService)
        {
            _context = context;
            _hub = hub;
            _controlService = controlService;
        }

        // This attribute specifies that this action handles POST requests
        [HttpPost("armed")]
        public async Task<IActionResult> ToggleArmedStatus([FromBody] ArmedStatusDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Invalid request body.");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            if (!int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            try
            {
                await _controlService.SetDeviceArmedStatus(dto.DeviceId, dto.IsArmed, userId);
                return Ok();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
        }

        // ✅ Single implementation for user id lookup
        private static readonly string NameIdUri = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
        private int CurrentUserId => int.Parse(
            User.FindFirst(NameIdUri)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("User id claim missing")
        );

        // ✅ Single implementation for device resolution
        private async Task<backend.Models.Device?> ResolveOwnedDevice(int? id, string? name, int userId)
        {
            if (id.HasValue)
                return await _context.Devices.FirstOrDefaultAsync(d => d.Id == id.Value && d.UserId == userId);

            if (!string.IsNullOrWhiteSpace(name))
                return await _context.Devices.FirstOrDefaultAsync(d => d.Name.ToLower() == name.ToLower() && d.UserId == userId);

            return null;
        }

        // Toggle light
        [HttpPost("light")]
        public async Task<IActionResult> ToggleLight([FromQuery] int? id, [FromQuery] string? name, [FromBody] bool status)
        {
            var device = await ResolveOwnedDevice(id, name, CurrentUserId);
            if (device == null) return NotFound(new { message = "Light not found" });
            if (device.Type == null || !device.Type.ToLower().Contains("light"))
                return BadRequest(new { message = "Device is not a light type" });

            device.Status = status;
            await _context.SaveChangesAsync();

            await _hub.Clients.All.SendAsync("ReceiveDeviceState", device.Id, new { type = "light", status = device.Status });
            return Ok(new { message = $"Light '{device.Name}' updated", status = device.Status });
        }

        // Set thermostat
        [HttpPost("thermostat")]
        public async Task<IActionResult> SetThermostat([FromQuery] int? id, [FromQuery] string? name, [FromBody] double temperature)
        {
            var device = await ResolveOwnedDevice(id, name, CurrentUserId);
            if (device == null) return NotFound(new { message = "Thermostat not found" });
            if (device.Type == null || !device.Type.ToLower().Contains("thermostat"))
                return BadRequest(new { message = "Device is not a thermostat type" });

            await _context.SaveChangesAsync();

            await _hub.Clients.All.SendAsync("ReceiveDeviceState", device.Id, new { type = "thermostat", value = temperature });
            return Ok(new { message = $"Thermostat '{device.Name}' set to {temperature}°C" });
        }

        // Toggle door
        [HttpPost("door")]
        public async Task<IActionResult> ToggleDoor([FromQuery] int? id, [FromQuery] string? name, [FromBody] bool locked)
        {
            var device = await ResolveOwnedDevice(id, name, CurrentUserId);
            if (device == null) return NotFound(new { message = "Door not found" });
            if (device.Type == null || !device.Type.ToLower().Contains("door"))
                return BadRequest(new { message = "Device is not a door type" });

            device.Status = locked;
            await _context.SaveChangesAsync();

            await _hub.Clients.All.SendAsync("ReceiveDeviceState", device.Id, new { type = "door", status = device.Status });
            return Ok(new { message = $"Door '{device.Name}' updated", status = device.Status });
        }
    }

}