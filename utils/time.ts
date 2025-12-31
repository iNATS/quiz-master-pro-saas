
/**
 * Utility to get and format time in Algeria Standard Time (UTC+1)
 */

export const getAlgeriaNow = (): Date => {
  // Returns current date/time adjusted to Africa/Algiers timezone
  const now = new Date();
  const algeriaTimeString = now.toLocaleString("en-US", { timeZone: "Africa/Algiers" });
  return new Date(algeriaTimeString);
};

export const formatToAlgeriaTime = (dateInput: string | Date, language: 'en' | 'ar' = 'en'): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleString(language === 'ar' ? 'ar-DZ' : 'en-GB', {
    timeZone: "Africa/Algiers",
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export const isFuture = (dateStr: string): boolean => {
  const target = new Date(dateStr);
  const now = getAlgeriaNow();
  return target > now;
};

export const isPast = (dateStr: string): boolean => {
  const target = new Date(dateStr);
  const now = getAlgeriaNow();
  return target < now;
};
