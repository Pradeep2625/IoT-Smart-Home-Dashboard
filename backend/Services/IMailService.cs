using backend.Models;
using System.Threading;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IMailService
    {
        Task<bool> SendMailAsync(MailData data, CancellationToken ct = default);
    }
}