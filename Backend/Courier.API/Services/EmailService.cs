using System.Net;
using System.Net.Mail;

public class EmailService
{
    public async Task SendEmail(string toEmail, string subject, string body)
    {
        var smtpClient = new SmtpClient("smtp.gmail.com")
        {
            Port = 587,

            // 🔥 HERE is your credential
            Credentials = new NetworkCredential(
                "witharana92test@gmail.com",
                "svmvvjqoobvdmgha" // 👈 App Password
            ),

            EnableSsl = true,
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress("witharana92test@gmail.com"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true,
        };

        mailMessage.To.Add(toEmail);

        await smtpClient.SendMailAsync(mailMessage);
    }
}