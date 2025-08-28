using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;
using backend.Data;
namespace backend.Controllers
{
    [ApiController]
    [Route("api/control")]
    [Authorize]
    public class ControlController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ControlController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("light/{id}")]
        public async Task<IActionResult> ToggleLight(int id, [FromBody] bool status)
        {
            var device = await _context.Devices.FindAsync(id);
            if (device == null || device.Type != "light") return NotFound();
            device.Status = status;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("thermostat/{id}")]
        public async Task<IActionResult> SetThermostat(int id, [FromBody] double temperature)
        {
            var device = await _context.Devices.FindAsync(id);
            if (device == null || device.Type != "thermostat") return NotFound();
            // Simulate setting temperature (in real IoT, call device API)
            await _context.SaveChangesAsync(); // No status change here; adjust model if needed
            return Ok();
        }

        [HttpPost("door/{id}")]
        public async Task<IActionResult> ToggleDoor(int id, [FromBody] bool locked)
        {
            var device = await _context.Devices.FindAsync(id);
            if (device == null || device.Type != "door") return NotFound();
            device.Status = locked;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}