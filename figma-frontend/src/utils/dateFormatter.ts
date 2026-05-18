/**
 * Date and time formatting utilities
 */

/**
 * Format ISO datetime to human-friendly format (YYYY-MM-DD, HH:MM:SS AM/PM)
 * @param isoString - ISO datetime string
 * @param showSeconds - Include seconds in output (default: true)
 * @returns Formatted datetime string or empty string if invalid
 */
export const formatDateTime = (isoString: string | null | undefined, showSeconds = true): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    // Format date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Format time as HH:MM:SS or HH:MM with AM/PM
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12Str = String(hour12).padStart(2, '0');
    
    if (showSeconds) {
      return `${dateStr}, ${hour12Str}:${minutes}:${seconds} ${ampm}`;
    } else {
      return `${dateStr}, ${hour12Str}:${minutes} ${ampm}`;
    }
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

/**
 * Format ISO date to human-friendly format (YYYY-MM-DD)
 * @param isoString - ISO date string
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (isoString: string | null | undefined): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format ISO time to 12-hour format (HH:MM:SS AM/PM or HH:MM AM/PM)
 * @param isoString - ISO datetime or time string
 * @param showSeconds - Include seconds in output (default: true)
 * @returns Formatted time string or empty string if invalid
 */
export const formatTime12Hour = (isoString: string | null | undefined, showSeconds = true): string => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12Str = String(hour12).padStart(2, '0');
    
    if (showSeconds) {
      return `${hour12Str}:${minutes}:${seconds} ${ampm}`;
    } else {
      return `${hour12Str}:${minutes} ${ampm}`;
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * Format ISO datetime range to readable format
 * @param startDateTime - ISO start datetime
 * @param endDateTime - ISO end datetime
 * @returns Formatted range string
 */
export const formatDateTimeRange = (startDateTime: string | null | undefined, endDateTime: string | null | undefined): string => {
  const start = formatTime12Hour(startDateTime, false);
  const end = formatTime12Hour(endDateTime, false);
  
  if (!start || !end) return '';
  return `${start} - ${end}`;
};
