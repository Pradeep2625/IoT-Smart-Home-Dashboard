using System.Threading.Tasks;
using backend.Models;
using System.Collections.Generic;

namespace backend.Services
{
    public interface IDeviceService
    {
        Task<List<Device>> GetAllDevices();
        Task<List<Device>> GetDevicesByUser(int userId);
        Task<Device?> GetDeviceById(int id);
        Task AddDevice(Device device);
        Task UpdateDevice(Device device);
        Task DeleteDevice(int id);
    }
}
