using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Services;
using backend.Data;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/sensors")]
    [Authorize]
    public class SensorsController : ControllerBase
    {
        private readonly ISensorService _sensorService;
        private readonly ApplicationDbContext _context;
        private static readonly string NameIdUri = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

        public SensorsController(ISensorService sensorService, ApplicationDbContext context)
        {
            _sensorService = sensorService;
            _context = context;
        }

        private int CurrentUserId => int.Parse(
            User.FindFirst(NameIdUri)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("User id claim missing")
        );

        // Latest security alert string for device
        [HttpGet("security")]
        public async Task<IActionResult> GetSecurityAlert([FromQuery] int deviceId)
        {
            var owned = await _context.Devices.AnyAsync(d => d.Id == deviceId && d.UserId == CurrentUserId);
            if (!owned) return Forbid();

            var latest = await _context.Alerts
            .Where(a => a.DeviceId == deviceId)
            .OrderByDescending(a => a.Timestamp)
            .Select(a => a.Message)
            .FirstOrDefaultAsync();

                return Ok(latest ?? "None");

        }

        // Security alert history (latest N)
        [HttpGet("security/history")]
        public async Task<IActionResult> GetSecurityHistory([FromQuery] int deviceId, [FromQuery] int take = 20)
        {
            var owned = await _context.Devices.AnyAsync(d => d.Id == deviceId && d.UserId == CurrentUserId);
            if (!owned) return Forbid();
            var limit = Math.Clamp(take, 1, 100);
            var alerts = await _context.Alerts
                .Where(a => a.DeviceId == deviceId)
                .OrderByDescending(a => a.Timestamp)
                .Take(limit)
                .Select(a => new { a.Id, a.Type, a.Message, a.Timestamp, a.IsAcknowledged })
                .ToListAsync();

            return Ok(alerts);

        }

    }
}
