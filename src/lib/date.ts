/**
Helpers for Asia/Jakarta (WIB - UTC+7) Timezone calculations
*/

export const TIMEZONE = 'Asia/Jakarta';

/**
 * Returns YYYY-MM-DD formatted date string in Asia/Jakarta timezone
 */
export function getJakartaDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

/**
 * Returns HH:mm:ss time string in Asia/Jakarta timezone
 */
export function getJakartaTimeString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * Returns full readable date time in Indonesian: "Kamis, 8 Oktober 2026 08:30 WIB"
 */
export function formatJakartaFullDateTime(isoOrDateString: string | null): string {
  if (!isoOrDateString) return '-';
  const date = new Date(isoOrDateString);
  if (isNaN(date.getTime())) return isoOrDateString;

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date) + ' WIB';
}

/**
 * Returns formatted time: "08:15 WIB"
 */
export function formatJakartaTime(isoOrDateString: string | null): string {
  if (!isoOrDateString) return '-';
  const date = new Date(isoOrDateString);
  if (isNaN(date.getTime())) return isoOrDateString;

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date) + ' WIB';
}

/**
 * Determines if clock-in is late based on workStartTime ("08:00") and lateThresholdMinutes (15)
 */
export function calculateIsLate(clockInDate: Date, workStartTimeStr: string = '08:00', thresholdMinutes: number = 15): boolean {
  // Extract hour & minute from clockInDate in Jakarta timezone
  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).format(clockInDate);

  const [inHour, inMin] = timeStr.split(':').map(Number);
  const [startHour, startMin] = workStartTimeStr.split(':').map(Number);

  const clockInTotalMinutes = inHour * 60 + inMin;
  const thresholdTotalMinutes = startHour * 60 + startMin + thresholdMinutes;

  return clockInTotalMinutes > thresholdTotalMinutes;
}
