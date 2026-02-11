import { NextRequest, NextResponse } from 'next/server';
import { crawlAllSites, getCrawler } from '@/lib/crawlers';
import { postService } from '@/lib/db/post-service';
import type { ApiResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

// POST /api/crawl - 크롤링 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { site } = body;

    let posts;

    if (site) {
      // 특정 사이트만 크롤링
      const crawler = getCrawler(site);
      if (!crawler) {
        return NextResponse.json(
          {
            success: false,
            error: `Crawler not found for site: ${site}`,
          } as ApiResponse<null>,
          { status: 404 }
        );
      }

      posts = await crawler.crawl();
    } else {
      // 모든 사이트 크롤링
      posts = await crawlAllSites();
    }

    // 데이터베이스에 저장
    const result = await postService.savePosts(posts);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('POST /api/crawl error:', error);

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to crawl',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET /api/crawl - 크롤링 상태 조회 (선택사항)
export async function GET() {
  try {
    const { prisma } = await import('@/lib/db/prisma');

    const sites = await prisma.site.findMany({
      select: {
        name: true,
        displayName: true,
        lastCrawledAt: true,
        isActive: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    const response: ApiResponse<typeof sites> = {
      success: true,
      data: sites,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/crawl error:', error);

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to get crawl status',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
