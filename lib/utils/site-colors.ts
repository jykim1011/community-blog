// 17개 커뮤니티 사이트별 색상 테마
export interface SiteColorTheme {
  bg: string;
  text: string;
  border: string;
  darkBg: string;
  darkText: string;
  darkBorder: string;
}

export const siteColors: Record<string, SiteColorTheme> = {
  clien: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    darkBg: 'dark:bg-blue-900',
    darkText: 'dark:text-blue-300',
    darkBorder: 'dark:border-blue-800',
  },
  theqoo: {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-200',
    darkBg: 'dark:bg-pink-900',
    darkText: 'dark:text-pink-300',
    darkBorder: 'dark:border-pink-800',
  },
  ruliweb: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    darkBg: 'dark:bg-purple-900',
    darkText: 'dark:text-purple-300',
    darkBorder: 'dark:border-purple-800',
  },
  dcinside: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    darkBg: 'dark:bg-green-900',
    darkText: 'dark:text-green-300',
    darkBorder: 'dark:border-green-800',
  },
  inven: {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    border: 'border-violet-200',
    darkBg: 'dark:bg-violet-900',
    darkText: 'dark:text-violet-300',
    darkBorder: 'dark:border-violet-800',
  },
  ppomppu: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    darkBg: 'dark:bg-orange-900',
    darkText: 'dark:text-orange-300',
    darkBorder: 'dark:border-orange-800',
  },
  mlbpark: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    darkBg: 'dark:bg-red-900',
    darkText: 'dark:text-red-300',
    darkBorder: 'dark:border-red-800',
  },
  natepann: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    darkBg: 'dark:bg-cyan-900',
    darkText: 'dark:text-cyan-300',
    darkBorder: 'dark:border-cyan-800',
  },
  bobaedream: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    darkBg: 'dark:bg-indigo-900',
    darkText: 'dark:text-indigo-300',
    darkBorder: 'dark:border-indigo-800',
  },
  etoland: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
    border: 'border-teal-200',
    darkBg: 'dark:bg-teal-900',
    darkText: 'dark:text-teal-300',
    darkBorder: 'dark:border-teal-800',
  },
  humoruniv: {
    bg: 'bg-lime-100',
    text: 'text-lime-700',
    border: 'border-lime-200',
    darkBg: 'dark:bg-lime-900',
    darkText: 'dark:text-lime-300',
    darkBorder: 'dark:border-lime-800',
  },
  cook82: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    border: 'border-rose-200',
    darkBg: 'dark:bg-rose-900',
    darkText: 'dark:text-rose-300',
    darkBorder: 'dark:border-rose-800',
  },
  slrclub: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-200',
    darkBg: 'dark:bg-sky-900',
    darkText: 'dark:text-sky-300',
    darkBorder: 'dark:border-sky-800',
  },
  gasengi: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    darkBg: 'dark:bg-emerald-900',
    darkText: 'dark:text-emerald-300',
    darkBorder: 'dark:border-emerald-800',
  },
  hygall: {
    bg: 'bg-fuchsia-100',
    text: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
    darkBg: 'dark:bg-fuchsia-900',
    darkText: 'dark:text-fuchsia-300',
    darkBorder: 'dark:border-fuchsia-800',
  },
  todayhumor: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    darkBg: 'dark:bg-amber-900',
    darkText: 'dark:text-amber-300',
    darkBorder: 'dark:border-amber-800',
  },
};

// 사이트 색상 가져오기 (기본값: 회색)
export function getSiteColor(siteName: string): SiteColorTheme {
  return siteColors[siteName] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    darkBg: 'dark:bg-gray-900',
    darkText: 'dark:text-gray-300',
    darkBorder: 'dark:border-gray-800',
  };
}

// 클래스명 문자열 생성
export function getSiteColorClasses(siteName: string): string {
  const theme = getSiteColor(siteName);
  return `${theme.bg} ${theme.text} ${theme.border} ${theme.darkBg} ${theme.darkText} ${theme.darkBorder}`;
}
