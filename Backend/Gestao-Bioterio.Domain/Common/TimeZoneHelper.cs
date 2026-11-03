using System;

namespace Gestao_Bioterio.Domain.Common
{
    public static class TimeZoneHelper
    {
        public static readonly TimeZoneInfo CampoGrandeTimeZone = GetCampoGrandeTimeZone();

        private static TimeZoneInfo GetCampoGrandeTimeZone()
        {
            if (TimeZoneInfo.TryFindSystemTimeZoneById("America/Campo_Grande", out var ianaTz))
                return ianaTz;

            if (TimeZoneInfo.TryFindSystemTimeZoneById("Central Brazilian Standard Time", out var winTz))
                return winTz;

            return TimeZoneInfo.Local;
        }

        public static DateTime ConvertToCampoGrandeTime(DateTime dateTime)
        {
            var kind = dateTime.Kind;
            if (kind == DateTimeKind.Utc)
            {
                return TimeZoneInfo.ConvertTimeFromUtc(dateTime, CampoGrandeTimeZone);
            }

            if (kind == DateTimeKind.Unspecified)
            {
                var utcDateTime = DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
                return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, CampoGrandeTimeZone);
            }

            return TimeZoneInfo.ConvertTime(dateTime, CampoGrandeTimeZone);
        }

        public static DateTime GetNowInCampoGrande()
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, CampoGrandeTimeZone);
        }
    }
}
