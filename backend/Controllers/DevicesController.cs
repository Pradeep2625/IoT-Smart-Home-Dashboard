using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;
namespace backend.Controllers
{
    [ApiController]
    [Route("api/devices")]
    [Authorize]
    public class DevicesController : ControllerBase
    {
        private readonly IDeviceService _deviceService;

        public DevicesController(IDeviceService deviceService)
        {
            _deviceService = deviceService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDevices()
        {
            var devices = await _deviceService.GetAllDevices();
            return Ok(devices);
        }

        [HttpPost]
        public async Task<IActionResult> AddDevice([FromBody] Device device)
        {
            await _deviceService.AddDevice(device);
            return CreatedAtAction(nameof(GetDevices), new { id = device.Id }, device);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDevice(int id, [FromBody] Device device)
        {
            if (id != device.Id) return BadRequest();
            await _deviceService.UpdateDevice(device);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDevice(int id)
        {
            await _deviceService.DeleteDevice(id);
            return NoContent();
        }
    }
}