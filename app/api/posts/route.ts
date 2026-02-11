import { NextRequest, NextResponse } from 'next/server';
import { postService } from '@/lib/db/post-service';
import type { ApiResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

// GET /api/posts - 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const siteId = searchParams.get('site') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await postService.getPosts({
      page,
      limit,
      siteId,
      search,
    });

    const response: ApiResponse<typeof result.posts> = {
      success: true,
      data: result.posts,
      pagination: result.pagination,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/posts error:', error);

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch posts',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
