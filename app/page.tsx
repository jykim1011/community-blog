import Link from 'next/link';
import { postService } from '@/lib/db/post-service';
import { PostCard } from '@/components/post-card';
import { Pagination } from '@/components/pagination';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 20;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; site?: string }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1'));
  const currentSite = params.site || null;

  // 사이트 목록 가져오기
  const sites = await prisma.site.findMany({
    where: { isActive: true },
    select: {
      id: true,
      displayName: true,
      name: true,
    },
  });

  // 사이트 name → id 변환
  const selectedSite = currentSite
    ? sites.find((s) => s.name === currentSite)
    : null;

  // 게시글 가져오기
  const { posts, pagination } = await postService.getPosts({
    page: currentPage,
    limit: POSTS_PER_PAGE,
    siteId: selectedSite?.id,
  });

  const totalPages = Math.ceil(pagination.total / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              커뮤니티 통합 블로그
            </h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {pagination.total}개의 게시글
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 사이트 필터 */}
        {sites.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                className={
                  !currentSite
                    ? 'px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium'
                    : 'px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              >
                전체
              </Link>
              {sites.map((site) => (
                <Link
                  key={site.id}
                  href={`/?site=${site.name}`}
                  className={
                    currentSite === site.name
                      ? 'px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium'
                      : 'px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                >
                  {site.displayName}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 게시글 목록 */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              게시글을 불러오는 중입니다...
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              자동 크롤링이 진행 중입니다. 잠시 후 새로고침 해주세요.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  author={post.author}
                  url={post.url}
                  site={{
                    displayName: post.site.displayName,
                    name: post.site.name,
                  }}
                  viewCount={post.viewCount}
                  commentCount={post.commentCount}
                  likeCount={post.likeCount}
                  createdAt={post.createdAt}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              site={currentSite}
            />
          </>
        )}
      </main>

      {/* 푸터 */}
      <footer className="mt-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            커뮤니티 통합 블로그 - 모든 게시글은 원본 사이트에 저작권이 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
