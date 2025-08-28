using System;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<string> Login(string username, string password);
        Task Register(User user);
    }
}