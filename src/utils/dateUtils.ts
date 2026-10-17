/**
 * Date Utility Helpers for SiteSaathi
 * Handles manual DD-MM-YYYY text input, ISO conversion, and formatted audit timestamps.
 */

/**
 * Returns today's date formatted as DD-MM-YYYY (e.g. "17-10-2026")
 */
export const getTodayFormatted = (): string => {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
};

/**
 * Converts any ISO date string (YYYY-MM-DD or full ISO) to display format DD-MM-YYYY.
 * If already DD-MM-YYYY or empty, returns as-is or today's date.
 */
export const toDisplayDate = (dateStr?: string): string => {
  if (!dateStr || dateStr.trim() === '') {
    return getTodayFormatted();
  }
  const clean = dateStr.trim();
  // If already DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
    return clean;
  }
  // If YYYY-MM-DD or ISO string
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const parts = clean.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return clean;
};

/**
 * Converts user-typed manual date (DD-MM-YYYY or DD/MM/YYYY) to standard ISO date YYYY-MM-DD.
 * If already YYYY-MM-DD, returns as-is.
 */
export const toIsoDate = (inputStr: string): string => {
  if (!inputStr || inputStr.trim() === '') {
    return new Date().toISOString().split('T')[0];
  }
  const clean = inputStr.trim();
  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('-');
    return `${y}-${m}-${d}`;
  }
  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split('/');
    return `${y}-${m}-${d}`;
  }
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }
  // Fallback to today if unrecognized format
  return clean;
};

/**
 * Formats an ISO timestamp into a human-readable Date + Time string (e.g. "17 Oct 2026, 01:35 PM").
 */
export const formatAuditTimestamp = (
  timestampStr?: string,
  language: 'en' | 'hi' = 'en'
): string => {
  if (!timestampStr) return '';
  const dateObj = new Date(timestampStr);
  if (isNaN(dateObj.getTime())) return timestampStr;

  const datePart = dateObj.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const timePart = dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${datePart}, ${timePart}`;
};
