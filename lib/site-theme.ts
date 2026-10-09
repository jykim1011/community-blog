/**
 * 사이트별 배지/색상/도메인 테마.
 * post-card, viewer 등 여러 곳에서 공유하기 위해 분리.
 */

export const SITE_THEME: Record<string, { color: string; badge: string }> = {
  clien:      { color: '#475569', badge: '클' },
  theqoo:     { color: '#d6006c', badge: '더' },
  ruliweb:    { color: '#c81e1e', badge: '루' },
  dcinside:   { color: '#d1410c', badge: 'DC' },
  fmkorea:    { color: '#d97706', badge: 'FM' },
  inven:      { color: '#b4530b', badge: '인' },
  arca:       { color: '#ea580c', badge: '아카' },
  ppomppu:    { color: '#a16207', badge: '뽐' },
  mlbpark:    { color: '#0b3b5c', badge: 'MP' },
  natepann:   { color: '#c92b2b', badge: '네' },
  instiz:     { color: '#7c3aed', badge: '인스' },
  bobaedream: { color: '#1e3a8a', badge: '보' },
  etoland:    { color: '#1f6b2a', badge: '에' },
  humoruniv:  { color: '#1b4a9e', badge: '유' },
  cook82:     { color: '#b02727', badge: '82' },
  slrclub:    { color: '#2d3a4a', badge: 'SLR' },
  damoang:    { color: '#0f766e', badge: '다' },
  orbi:       { color: '#1d4ed8', badge: '오' },
  gasengi:    { color: '#1e6b31', badge: '가' },
  hygall:     { color: '#7a2a94', badge: '혜' },
  todayhumor: { color: '#5e6b10', badge: '투' },
  quasarzone: { color: '#c2410c', badge: 'Q' },
  dealbada:   { color: '#854d0e', badge: '딜' },
  dvdprime:   { color: '#4338ca', badge: 'DV' },
  coolenjoy:  { color: '#0f766e', badge: '쿨' },
  extmovie:   { color: '#7e22ce', badge: 'EX' },
};

export const SITE_DOMAIN: Record<string, string> = {
  clien:      'clien.net',
  theqoo:     'theqoo.net',
  ruliweb:    'ruliweb.com',
  dcinside:   'dcinside.com',
  fmkorea:    'fmkorea.com',
  inven:      'inven.co.kr',
  arca:       'arca.live',
  ppomppu:    'ppomppu.co.kr',
  mlbpark:    'mlbpark.donga.com',
  natepann:   'pann.nate.com',
  instiz:     'instiz.net',
  bobaedream: 'bobaedream.co.kr',
  etoland:    'etoland.co.kr',
  humoruniv:  'web.humoruniv.com',
  cook82:     '82cook.com',
  slrclub:    'slrclub.com',
  damoang:    'damoang.com',
  orbi:       'orbi.kr',
  gasengi:    'gasengi.com',
  hygall:     'gall.dcinside.com',
  todayhumor: 'todayhumor.co.kr',
  quasarzone: 'quasarzone.com',
  dealbada:   'dealbada.com',
  dvdprime:   'dvdprime.com',
  coolenjoy:  'coolenjoy.net',
  extmovie:   'extmovie.com',
};

export function siteTheme(siteName: string, displayName = '') {
  return SITE_THEME[siteName] ?? { color: '#71717a', badge: displayName.charAt(0) || '?' };
}

export function faviconUrl(siteName: string): string | null {
  const domain = SITE_DOMAIN[siteName];
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;
}
