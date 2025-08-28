using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;
namespace backend.Controllers
{
    [ApiController]
    [Route("api/sensors")]
    [Authorize]
    public class SensorsController : ControllerBase
    {
        private readonly ISensorService _sensorService;

        public SensorsController(ISensorService sensorService)
        {
            _sensorService = sensorService;
        }

        [HttpGet("temperature")]
        public async Task<IActionResult> GetTemperature(int deviceId)
        {
            var data = await _sensorService.GetLatestSensorData(deviceId);
            return Ok(data.Temperature);
        }

        [HttpGet("security")]
        public async Task<IActionResult> GetSecurityAlerts(int deviceId)
        {
            var data = await _sensorService.GetLatestSensorData(deviceId);
            return Ok(data.SecurityAlert);
        }
    }
}