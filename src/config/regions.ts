export type RegionConfig = {
  name: string;
  domain: string;
  languages: readonly string[];
  defaultLanguage: string;
  currency: string;
  currencyOptions: readonly string[];
};

export const regions: Record<string, RegionConfig> = {
  me: {
    name: 'Montenegro',
    domain: 'me',
    languages: ['en', 'sr', 'ru'],
    defaultLanguage: 'en',
    currency: 'EUR',
    currencyOptions: ['EUR', 'USD', 'RUB'],
  },
} as const;

export const defaultRegion = 'me';

export function getRegionBySubdomain(subdomain: string): RegionConfig | undefined {
  return regions[subdomain];
}

export function getRegionCountryCode(regionKey: string): string {
  return regionKey.toUpperCase();
}
