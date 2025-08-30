using backend.Models;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;

namespace backend.Services
{
    public class MailService : IMailService
    {
        private readonly IConfiguration _config;

        public MailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task<bool> SendMailAsync(MailData data, CancellationToken ct = default)
        {
            try
            {
                var host = _config["MailSettings:SmtpServer"] ?? "smtp.gmail.com";
                var port = int.TryParse(_config["MailSettings:Port"], out var p) ? p : 587;
                var enableSsl = bool.TryParse(_config["MailSettings:EnableSSL"], out var ssl) ? ssl : true;

                var username = _config["MailSettings:Username"]; // your Gmail login
                var from = _config["MailSettings:SenderEmail"]; // same Gmail (best), or verified alias
                var password = _config["MailSettings:Password"];

                if (string.IsNullOrWhiteSpace(from))
                {
                    Console.WriteLine("[SmtpClient] Config MailSettings:SenderEmail is missing");
                    return false;
                }
                if (string.IsNullOrWhiteSpace(data.EmailToId))
                {
                    Console.WriteLine("[SmtpClient] 'to' address is missing");
                    return false;
                }

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(from),
                    Subject = data.EmailSubject,
                    Body = data.EmailBody,
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(data.EmailToId); ;      // App Password

                using var smtp = new SmtpClient(host)
                {
                    Port = port,
                    EnableSsl = enableSsl,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(username, password),
                };

                using var msg = new MailMessage
                {
                    From = new MailAddress(from),
                    Subject = data.EmailSubject,
                    Body = data.EmailBody,
                    IsBodyHtml = true
                };
                msg.To.Add(data.EmailToId);

                await smtp.SendMailAsync(msg, ct);
                return true;
            }
            catch (System.Exception ex)
            {
                System.Console.WriteLine($"[SmtpClient] {ex.GetType().Name}: {ex.Message}");
                return false;
            }
        }
    }

}