/**
 * Format a number as currency (EUR)
 * @param amount - Amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "€123.45")
 */
export const formatCurrency = (amount: number, decimals: number = 2): string => {
  return `€${amount.toFixed(decimals)}`;
};

/**
 * Format a number as percentage
 * @param value - Value to format (0-1 range or 0-100 range)
 * @param decimals - Number of decimal places (default: 0)
 * @param isDecimal - Whether the value is in decimal format (0-1) or percentage format (0-100)
 * @returns Formatted percentage string (e.g., "25%" or "25.5%")
 */
export const formatPercentage = (
  value: number,
  decimals: number = 0,
  isDecimal: boolean = false
): string => {
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format a date to a localized date string
 * @param date - Date string or Date object
 * @param locale - Locale string (default: "nl-NL")
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, locale: string = "nl-NL"): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
};

/**
 * Format a date to ISO string (YYYY-MM-DD)
 * @param date - Date string or Date object
 * @returns ISO date string (YYYY-MM-DD)
 */
export const formatDateISO = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString().split("T")[0];
};

/**
 * Format a number with specified decimal places
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

/**
 * Format a number as a whole number (no decimals)
 * @param value - Number to format
 * @returns Formatted whole number string
 */
export const formatWholeNumber = (value: number): string => {
  return Math.round(value).toString();
};

/**
 * Format currency for chart tooltips and labels
 * @param value - Amount to format
 * @returns Formatted currency string for charts
 */
export const formatCurrencyForChart = (value: number): string => {
  return formatCurrency(value, 2);
};

/**
 * Format a date range string
 * @param startDate - Start date string or Date object
 * @param endDate - End date string or Date object
 * @param locale - Locale string (default: "nl-NL")
 * @returns Formatted date range string (e.g., "1 jan - 31 dec 2024")
 */
export const formatDateRange = (
  startDate: string | Date,
  endDate: string | Date,
  locale: string = "nl-NL"
): string => {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  
  const startFormatted = start.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
  const endFormatted = end.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Format month/year string from date
 * @param date - Date string or Date object
 * @returns Formatted month/year string (e.g., "01/24" for January 2024)
 */
export const formatMonthYear = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = String(dateObj.getFullYear()).slice(-2);
  return `${month}/${year}`;
};

