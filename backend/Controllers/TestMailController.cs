// backend/Controllers/TestMailController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.Models;

// Adjust this namespace to match your project (e.g., backend.Services.Mail if you used that path)
using backend.Services; // IMailService, MailData

namespace backend.Controllers
{
    [ApiController]
    [Route("api/test-mail")]
    public class TestMailController : ControllerBase
    {
        private readonly IMailService _mail;

        public TestMailController(IMailService mail)
        {
            _mail = mail;
        }

        // POST /api/test-mail?to=you@example.com&name=Tester
        // POST /api/test-mail?to=you@example.com&name=Tester
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Send([FromQuery] string to, [FromQuery] string name = "Tester")
        {
            if (string.IsNullOrWhiteSpace(to))
                return BadRequest(new { message = "Query parameter 'to' is required." });

            var ok = await _mail.SendMailAsync(new MailData
            {
                EmailToId = to,
                EmailToName = name,
                EmailSubject = "Smart Home: Gmail SMTP Test",
                EmailBody = "Hello from Smart Home via Gmail SMTP.",
            });

            return ok ? Ok(new { message = "Email sent" }) : StatusCode(500, new { message = "Failed to send" });
        }
    }
}
