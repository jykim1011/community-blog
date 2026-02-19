import Link from 'next/link';
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
}: PostCardProps) {
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all dark:border-gray-700 dark:hover:bg-gray-800"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {site.displayName}
            </span>
            <span>{author}</span>
            <span>{formatRelativeTime(new Date(createdAt))}</span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-500">
            {viewCount !== null && viewCount !== undefined && (
              <span>조회 {formatNumber(viewCount)}</span>
            )}
            {commentCount !== null && commentCount !== undefined && commentCount > 0 && (
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                댓글 {formatNumber(commentCount)}
              </span>
            )}
            {likeCount !== null && likeCount !== undefined && likeCount > 0 && (
              <span>추천 {formatNumber(likeCount)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
