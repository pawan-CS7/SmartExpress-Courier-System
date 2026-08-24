using System;

namespace Courier.API.Utils
{
    public static class TimeUtil
    {
        public static DateTime GetSriLankaTime()
        {
            // Sri Lanka Standard Time is UTC + 5:30. 
            // Using explicit offset ensures it works on Azure/AWS servers regardless of server's local timezone.
            return DateTime.UtcNow.AddHours(5).AddMinutes(30);
        }
    }
}
