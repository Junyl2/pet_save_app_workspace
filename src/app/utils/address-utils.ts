/**
 * Utility functions for address formatting and parsing
 */

/**
 * Extracts city and district from a Korean address
 * @param address - Full address string (e.g., "서울특별시 강남구 도산대로 150  heerkdashjk daksjhdsa 06040")
 * @returns Formatted string with city and district (e.g., "서울특별시 강남구")
 */
export function extractCityAndDistrict(address: string): string {
  if (!address || typeof address !== 'string') {
    return 'N/A';
  }

  // Split the address by spaces and take the first two parts
  // Korean addresses typically start with "시/도 구/군"
  const parts = address.trim().split(' ');

  if (parts.length >= 2) {
    // Return first two parts (city and district)
    return `${parts[0]} ${parts[1]}`;
  } else if (parts.length === 1) {
    // If only one part, return it as is
    return parts[0];
  }

  return 'N/A';
}

/**
 * Formats address for display in product cards
 * @param address - Full address string
 * @returns Formatted address string
 */
export function formatAddressForDisplay(address: string): string {
  return extractCityAndDistrict(address);
}
