namespace backend.Services
{
    public interface IControlService
    {
        Task UpdateDeviceStatus(int deviceId, bool status);
        Task UpdateThermostatValue(int deviceId, double value);
        Task ToggleDoorStatus(int deviceId, bool status);
        Task ToggleArmedStatus(int deviceId, bool status);
    }
}
