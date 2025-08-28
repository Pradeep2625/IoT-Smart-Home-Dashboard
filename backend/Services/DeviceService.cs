using System;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;
namespace backend.Services
{
    public class DeviceService : IDeviceService
    {
        private readonly ApplicationDbContext _context;

        public DeviceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Device>> GetAllDevices()
        {
            return await _context.Devices.ToListAsync();
        }

        public async Task<Device> GetDeviceById(int id)
        {
            return await _context.Devices.FindAsync(id);
        }

        public async Task AddDevice(Device device)
        {
            _context.Devices.Add(device);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateDevice(Device device)
        {
            _context.Devices.Update(device);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteDevice(int id)
        {
            var device = await _context.Devices.FindAsync(id);
            if (device != null)
            {
                _context.Devices.Remove(device);
                await _context.SaveChangesAsync();
            }
        }
    }
}