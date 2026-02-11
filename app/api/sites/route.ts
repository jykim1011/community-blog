import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { ApiResponse } from '@/lib/types';

export const dynamic = 'force-dynamic';

// GET /api/sites - 사이트 목록 조회
export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        url: true,
        logo: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        displayName: 'asc',
      },
    });

    const response: ApiResponse<typeof sites> = {
      success: true,
      data: sites,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/sites error:', error);

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch sites',
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
