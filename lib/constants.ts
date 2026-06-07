export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://community-blog.pages.dev';

export const SITE_NAME = '통합 커뮤니티';
export const SITE_DESCRIPTION = '클리앙, 더쿠, 루리웹 등 한국 인기 커뮤니티 게시글을 한곳에서 모아보세요.';

export type SiteCategory = 'community' | 'hotdeal' | 'movie' | 'game';

export const siteConfigs: Record<string, { displayName: string; url: string; category: SiteCategory; disabled?: boolean }> = {
  clien: { displayName: '클리앙', url: 'https://www.clien.net', category: 'community' },
  theqoo: { displayName: '더쿠', url: 'https://theqoo.net', category: 'community' },
  ruliweb: { displayName: '루리웹', url: 'https://bbs.ruliweb.com', category: 'community' },
  dcinside: { displayName: '디시인사이드', url: 'https://gall.dcinside.com', category: 'community' },
  fmkorea: { displayName: '에펨코리아', url: 'https://www.fmkorea.com', category: 'community', disabled: true },
  inven: { displayName: '인벤', url: 'https://www.inven.co.kr', category: 'game' },
  arca: { displayName: '아카라이브', url: 'https://arca.live', category: 'community', disabled: true },
  ppomppu: { displayName: '뽐뿌', url: 'https://www.ppomppu.co.kr', category: 'hotdeal' },
  mlbpark: { displayName: '엠팍', url: 'https://mlbpark.donga.com', category: 'community' },
  natepann: { displayName: '네이트판', url: 'https://pann.nate.com', category: 'community' },
  instiz: { displayName: '인스티즈', url: 'https://www.instiz.net', category: 'community', disabled: true },
  bobaedream: { displayName: '보배드림', url: 'https://www.bobaedream.co.kr', category: 'community' },
  etoland: { displayName: '이토랜드', url: 'https://www.etoland.co.kr', category: 'community' },
  humoruniv: { displayName: '웃긴대학', url: 'https://www.humoruniv.com', category: 'community', disabled: true },
  cook82: { displayName: '82쿡', url: 'https://www.82cook.com', category: 'community' },
  slrclub: { displayName: 'SLR클럽', url: 'https://www.slrclub.com', category: 'community' },
  damoang: { displayName: '다모앙', url: 'https://damoang.net', category: 'community', disabled: true },
  orbi: { displayName: '오르비', url: 'https://orbi.kr', category: 'community', disabled: true },
  gasengi: { displayName: '가생이', url: 'https://www.gasengi.com', category: 'community' },
  hygall: { displayName: '해연갤', url: 'https://hygall.com', category: 'community' },
  todayhumor: { displayName: '오늘의유머', url: 'https://www.todayhumor.co.kr', category: 'community' },
  quasarzone: { displayName: '쿼사존', url: 'https://quasarzone.com', category: 'hotdeal' },
  extmovie: { displayName: '익스트림무비', url: 'https://extmovie.com', category: 'movie' },
  dvdprime: { displayName: 'DVDPrime', url: 'https://dvdprime.com', category: 'movie', disabled: true },
  dealbada: { displayName: '딜바다', url: 'http://www.dealbada.com', category: 'hotdeal' },
  coolenjoy: { displayName: '쿨엔조이', url: 'https://coolenjoy.net', category: 'community', disabled: true },
};

export const categoryLabels: Record<SiteCategory, string> = {
  community: '커뮤니티',
  hotdeal: '핫딜',
  movie: '영화',
  game: '게임',
};
