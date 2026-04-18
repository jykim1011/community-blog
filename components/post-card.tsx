'use client';

import { useState, useEffect } from 'react';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { getSiteColor } from '@/lib/utils/site-colors';
import { ShareButton } from '@/components/share-button';
import { BookmarkButton } from '@/components/bookmark-button';
import { useReadPosts } from '@/lib/hooks/use-read-posts';

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
  // 클라이언트에서만 상대 시간 렌더링 (hydration 오류 방지)
  const [relativeTime, setRelativeTime] = useState<string>('');
  const { isRead, markAsRead, isLoaded } = useReadPosts();

  useEffect(() => {
    setRelativeTime(formatRelativeTime(new Date(createdAt)));

    // 1분마다 업데이트
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(new Date(createdAt)));
    }, 60000);

    return () => clearInterval(interval);
  }, [createdAt]);

  const handleClick = () => {
    markAsRead(url);
  };

  const isReadPost = isLoaded && isRead(url);

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
  const siteColorTheme = getSiteColor(site.name);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="block px-3 py-2.5 sm:px-4 sm:py-3.5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all dark:border-gray-700 dark:hover:bg-gray-800"
    >
      <div className="w-full">
        {/* 제목 & 카테고리 */}
        <h3
          className={`text-base sm:text-lg font-semibold line-clamp-1 sm:line-clamp-2 mb-2.5 sm:mb-3 leading-relaxed ${
            isReadPost
              ? 'text-gray-500 dark:text-gray-500'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {category && (
            <span
              className={`inline-block px-2 py-0.5 mr-1.5 text-xs font-medium rounded ${
                isReadPost
                  ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                  : 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
              }`}
            >
              {category}
            </span>
          )}
          {title}
        </h3>

        {/* 메타 정보 */}
        <div className="space-y-1.5">
          {/* 커뮤니티 배지 & 작성자 & 시간 */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm leading-normal">
            {/* 커뮤니티 색상 배지 */}
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${siteColorTheme.bg} ${siteColorTheme.text} ${siteColorTheme.darkBg} ${siteColorTheme.darkText}`}>
              <img
                src={faviconUrl}
                alt=""
                className="w-3.5 h-3.5 rounded-sm"
                loading="lazy"
              />
              <span className="font-medium text-xs">
                {site.displayName}
              </span>
            </div>

            <span className="text-gray-400 dark:text-gray-600">·</span>
            <span className="truncate max-w-[100px] sm:max-w-none text-gray-700 dark:text-gray-300">{author}</span>
            <span className="text-gray-400 dark:text-gray-600">·</span>
            <span className="whitespace-nowrap text-gray-600 dark:text-gray-400">{relativeTime || '방금 전'}</span>
          </div>

          {/* 통계 정보 (아이콘 포함) + 공유 버튼 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs sm:text-sm leading-normal text-gray-600 dark:text-gray-400">
              {viewCount !== null && viewCount !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-500">👁️</span>
                  <span className="font-medium">{formatNumber(viewCount)}</span>
                </div>
              )}
              {commentCount !== null && commentCount !== undefined && commentCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-orange-500 dark:text-orange-400">💬</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {formatNumber(commentCount)}
                  </span>
                </div>
              )}
              {likeCount !== null && likeCount !== undefined && likeCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-red-500 dark:text-red-400">❤️</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatNumber(likeCount)}
                  </span>
                </div>
              )}
            </div>

            {/* 북마크 & 공유 버튼 */}
            <div className="flex items-center gap-1">
              <BookmarkButton url={url} title={title} site={site.name} />
              <ShareButton title={title} url={url} />
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}
