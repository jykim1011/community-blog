export const BLOCKED_DOMAINS = new Set([
  'clien.net',
  'etoland.co.kr',
  'quasarzone.com',
  'ruliweb.com',
  'orbi.kr',
  'arca.live',
  'damoang.net',
]);

export function isDomainBlocked(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return Array.from(BLOCKED_DOMAINS).some(
      d => hostname === d || hostname.endsWith('.' + d)
    );
  } catch {
    return false;
  }
}
