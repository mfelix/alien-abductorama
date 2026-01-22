/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji
 */
export function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Format timestamp as readable date
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format duration in seconds to human readable
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
