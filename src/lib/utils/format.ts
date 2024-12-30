export function formatDistrict(district: string): string {
    if (!district) return '';
    return district === '비례대표' ? '비례' : district;
  }