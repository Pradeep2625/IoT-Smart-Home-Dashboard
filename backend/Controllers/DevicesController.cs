using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;
using System.Security.Claims;

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

        // Unified claim lookup logic
        private static readonly string NameIdUri = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

        private int CurrentUserId => int.Parse(
            User.FindFirst(NameIdUri)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("User id claim missing")
        );

        [HttpGet]
        public async Task<IActionResult> GetDevices()
        {
            var devices = await _deviceService.GetDevicesByUser(CurrentUserId);
            return Ok(devices);
        }

        [HttpPost]
        public async Task<IActionResult> AddDevice([FromBody] DeviceDto deviceDto)
        {
            var newDevice = new Device
            {
                Name = deviceDto.Name,
                Type = deviceDto.Type,
                UserId = CurrentUserId,
                Status = false
            };

            await _deviceService.AddDevice(newDevice);
            return CreatedAtAction(nameof(GetDevices), new { id = newDevice.Id }, newDevice);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDevice(int id, [FromBody] Device device)
        {
            if (id != device.Id) return BadRequest();

            var persisted = await _deviceService.GetDeviceById(id);
            if (persisted == null) return NotFound();
            if (persisted.UserId != CurrentUserId) return Forbid();

            persisted.Name = device.Name;
            persisted.Type = device.Type;
            persisted.Status = device.Status;

            await _deviceService.UpdateDevice(persisted);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDevice(int id)
        {
            var persisted = await _deviceService.GetDeviceById(id);
            if (persisted == null) return NotFound();
            if (persisted.UserId != CurrentUserId) return Forbid();

            await _deviceService.DeleteDevice(id);
            return NoContent();
        }
    }
}
