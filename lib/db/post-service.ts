import { prisma } from './prisma';
import type { Post } from '../types';

export class PostService {
  // 게시글 목록 조회 (페이징)
  async getPosts(options: {
    page?: number;
    limit?: number;
    siteId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, siteId, search } = options;
    const skip = (page - 1) * limit;

    const where = {
      ...(siteId && { siteId }),
      ...(search && {
        title: {
          contains: search,
        },
      }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          site: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total,
      },
    };
  }

  // 게시글 저장 (중복 체크)
  async savePosts(posts: Post[]) {
    const saved = [];
    const skipped = [];

    for (const post of posts) {
      try {
        // URL로 중복 체크
        const existing = await prisma.post.findUnique({
          where: { url: post.url },
        });

        if (existing) {
          skipped.push(post.url);
          continue;
        }

        // 사이트 정보 가져오기 (없으면 생성)
        let site = await prisma.site.findUnique({
          where: { name: post.site },
        });

        if (!site) {
          site = await this.createDefaultSite(post.site);
        }

        // 게시글 저장
        const savedPost = await prisma.post.create({
          data: {
            title: post.title,
            author: post.author,
            url: post.url,
            thumbnail: post.thumbnail,
            viewCount: post.viewCount || 0,
            commentCount: post.commentCount || 0,
            likeCount: post.likeCount || 0,
            category: post.category,
            createdAt: post.createdAt,
            fetchedAt: post.fetchedAt,
            siteId: site.id,
          },
        });

        saved.push(savedPost);
      } catch (error) {
        console.error(`Failed to save post: ${post.url}`, error);
      }
    }

    return { saved: saved.length, skipped: skipped.length };
  }

  // 기본 사이트 정보 생성
  private async createDefaultSite(siteName: string) {
    const siteConfigs: Record<string, { displayName: string; url: string }> = {
      clien: { displayName: '클리앙', url: 'https://www.clien.net' },
      theqoo: { displayName: '더쿠', url: 'https://theqoo.net' },
      ruliweb: { displayName: '루리웹', url: 'https://bbs.ruliweb.com' },
    };

    const config = siteConfigs[siteName] || {
      displayName: siteName,
      url: `https://${siteName}.com`,
    };

    return prisma.site.create({
      data: {
        name: siteName,
        displayName: config.displayName,
        url: config.url,
      },
    });
  }

  // 오래된 게시글 삭제 (선택사항)
  async deleteOldPosts(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.post.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

export const postService = new PostService();
