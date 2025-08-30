using System;
namespace backend.Models
{

    public class MailData
    {
        public string EmailToId { get; set; } = default!;
        public string EmailToName { get; set; } = default!;
        public string EmailSubject { get; set; } = default!;
        public string EmailBody { get; set; } = default!;
    }
}