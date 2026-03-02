import { formatRelativeTime, formatNumber } from '@/lib/utils';

interface PostCardProps {
  id: string;
  title: string;
  author: string;
  url: string;
  site: {
    displayName: string;
    name: string;
  };
  viewCount?: number | null;
  commentCount?: number | null;
  likeCount?: number | null;
  createdAt: Date;
  thumbnail?: string;
  category?: string;
}

export function PostCard({
  title,
  author,
  url,
  site,
  viewCount,
  commentCount,
  likeCount,
  createdAt,
  category,
}: PostCardProps) {
  // 각 사이트의 도메인 매핑
  const getSiteDomain = (siteName: string): string => {
    const domainMap: Record<string, string> = {
      clien: 'clien.net',
      theqoo: 'theqoo.net',
      ruliweb: 'ruliweb.com',
      dcinside: 'dcinside.com',
      inven: 'inven.co.kr',
      ppomppu: 'ppomppu.co.kr',
      mlbpark: 'mlbpark.donga.com',
      natepann: 'pann.nate.com',
      ilbe: 'ilbe.com',
      bobaedream: 'bobaedream.co.kr',
      etoland: 'etoland.co.kr',
      humoruniv: 'web.humoruniv.com',
      cook82: '82cook.com',
      slrclub: 'slrclub.com',
      gasengi: 'gasengi.com',
      hygall: 'gall.dcinside.com',
      todayhumor: 'todayhumor.co.kr',
    };
    return domainMap[siteName] || siteName;
  };

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${getSiteDomain(site.name)}&sz=32`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-3 py-2.5 sm:px-4 sm:py-3.5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all dark:border-gray-700 dark:hover:bg-gray-800"
    >
      <div className="w-full">
          {/* 제목 - 모바일 1줄, 데스크톱 2줄 */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 sm:line-clamp-2 mb-2.5 sm:mb-3 leading-relaxed">
            {category && (
              <span className="inline-block px-2 py-0.5 mr-1.5 text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 rounded">
                {category}
              </span>
            )}
            {title}
          </h3>

        {/* 메타 정보 - 모바일에서 2줄로 배치 */}
        <div className="space-y-0.5 sm:space-y-0">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm leading-normal text-gray-700 dark:text-gray-300">
            {/* 커뮤니티 아이콘 + 이름 */}
            <div className="flex items-center gap-1">
              <img
                src={faviconUrl}
                alt=""
                className="w-4 h-4 rounded-sm"
                loading="lazy"
              />
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {site.displayName}
              </span>
            </div>
            <span className="text-gray-400 dark:text-gray-600">·</span>
            <span className="truncate max-w-[100px] sm:max-w-none">{author}</span>
            <span className="text-gray-400 dark:text-gray-600">·</span>
            <span className="whitespace-nowrap">{formatRelativeTime(new Date(createdAt))}</span>
          </div>

          {/* 통계 정보 */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm leading-normal text-gray-600 dark:text-gray-400">
            {viewCount !== null && viewCount !== undefined && (
              <span>조회 {formatNumber(viewCount)}</span>
            )}
            {commentCount !== null && commentCount !== undefined && commentCount > 0 && (
              <>
                {viewCount !== null && viewCount !== undefined && (
                  <span className="text-gray-400 dark:text-gray-600">·</span>
                )}
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  댓글 {formatNumber(commentCount)}
                </span>
              </>
            )}
            {likeCount !== null && likeCount !== undefined && likeCount > 0 && (
              <>
                {(viewCount !== null && viewCount !== undefined) ||
                 (commentCount !== null && commentCount !== undefined && commentCount > 0) ? (
                  <span className="text-gray-400 dark:text-gray-600">·</span>
                ) : null}
                <span>추천 {formatNumber(likeCount)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
