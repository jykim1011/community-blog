export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://community-blog.pages.dev';

export const SITE_NAME = '통합 커뮤니티';
export const SITE_DESCRIPTION = '클리앙, 더쿠, 루리웹 등 한국 인기 커뮤니티 게시글을 한곳에서 모아보세요.';

export const siteConfigs: Record<string, { displayName: string; url: string }> = {
  clien: { displayName: '클리앙', url: 'https://www.clien.net' },
  theqoo: { displayName: '더쿠', url: 'https://theqoo.net' },
  ruliweb: { displayName: '루리웹', url: 'https://bbs.ruliweb.com' },
  dcinside: { displayName: '디시인사이드', url: 'https://gall.dcinside.com' },
  fmkorea: { displayName: '에펨코리아', url: 'https://www.fmkorea.com' },
  inven: { displayName: '인벤', url: 'https://www.inven.co.kr' },
  arca: { displayName: '아카라이브', url: 'https://arca.live' },
  ppomppu: { displayName: '뽐뿌', url: 'https://www.ppomppu.co.kr' },
  mlbpark: { displayName: '엠팍', url: 'https://mlbpark.donga.com' },
  natepann: { displayName: '네이트판', url: 'https://pann.nate.com' },
  ilbe: { displayName: '일베', url: 'https://www.ilbe.com' },
  instiz: { displayName: '인스티즈', url: 'https://www.instiz.net' },
  bobaedream: { displayName: '보배드림', url: 'https://www.bobaedream.co.kr' },
  etoland: { displayName: '이토랜드', url: 'https://www.etoland.co.kr' },
  humoruniv: { displayName: '웃긴대학', url: 'https://www.humoruniv.com' },
  cook82: { displayName: '82쿡', url: 'https://www.82cook.com' },
  slrclub: { displayName: 'SLR클럽', url: 'https://www.slrclub.com' },
  damoang: { displayName: '다모앙', url: 'https://damoang.net' },
  orbi: { displayName: '오르비', url: 'https://orbi.kr' },
  gasengi: { displayName: '가생이', url: 'https://www.gasengi.com' },
  hygall: { displayName: '해연갤', url: 'https://hygall.com' },
  todayhumor: { displayName: '오늘의유머', url: 'https://www.todayhumor.co.kr' },
};
