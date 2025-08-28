using System;

using System.Threading.Tasks;
using backend.Models;

namespace backend.Services
{
    public interface IDeviceService
    {
        Task<IEnumerable<Device>> GetAllDevices();
        Task<Device> GetDeviceById(int id);
        Task AddDevice(Device device);
        Task UpdateDevice(Device device);
        Task DeleteDevice(int id);
    }
}