# 커뮤니티 통합 블로그

국내 주요 커뮤니티 사이트의 인기 게시글을 한 곳에서 모아볼 수 있는 통합 플랫폼입니다.

## 주요 기능

- 여러 커뮤니티 사이트의 베스트/인기 게시글 자동 크롤링
- 5분 간격 순환 크롤링 (사이트당 15분 주기)
- 사이트별 필터링
- 페이지네이션
- 원본 게시글로 바로 이동
- 다크모드 지원

## 기술 스택

### 프론트엔드
- **Next.js 16** - React 프레임워크 (App Router)
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링

### 백엔드
- **Next.js API Routes** - RESTful API
- **Prisma** - ORM
- **SQLite** - 데이터베이스
- **Cheerio** - HTML 파싱
- **Axios** - HTTP 클라이언트
- **node-cron** - 자동 크롤링 스케줄링

### 지원 사이트
- [x] 클리앙 - 모두의공원 게시판
- [x] 더쿠 - 핫 게시판
- [x] 루리웹 - 유머 게시판

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하세요.

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRAWL_INTERVAL_MINUTES=360
CRAWL_RATE_LIMIT_MS=1000
```

### 3. 데이터베이스 초기화

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

서버 시작 시 자동 크롤링이 활성화됩니다 (10초 후 첫 크롤링, 이후 5분 간격).

### 5. 수동 크롤링 (선택)

```bash
# 모든 사이트 크롤링
curl -X POST http://localhost:3000/api/crawl

# 특정 사이트만 크롤링
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"site": "clien"}'
```

## API 엔드포인트

### GET /api/posts
게시글 목록 조회

| 파라미터 | 설명 | 기본값 |
|---------|------|-------|
| `page` | 페이지 번호 | 1 |
| `limit` | 페이지당 게시글 수 | 20 |
| `site` | 사이트 ID로 필터링 | - |
| `search` | 제목 검색 | - |

### POST /api/crawl
크롤링 실행. `{"site": "clien"}` 으로 특정 사이트만 크롤링 가능.

### GET /api/sites
등록된 사이트 목록 조회

## 프로젝트 구조

```
community-blog/
├── app/
│   ├── api/
│   │   ├── posts/route.ts       # 게시글 API
│   │   ├── crawl/route.ts       # 크롤링 API
│   │   └── sites/route.ts       # 사이트 API
│   ├── page.tsx                 # 메인 페이지
│   ├── layout.tsx               # 레이아웃
│   └── globals.css
├── components/
│   ├── post-card.tsx            # 게시글 카드
│   └── pagination.tsx           # 페이지네이션
├── lib/
│   ├── crawlers/                # 크롤러
│   │   ├── base-crawler.ts      # 추상 베이스 클래스
│   │   ├── clien-crawler.ts     # 클리앙
│   │   ├── theqoo-crawler.ts    # 더쿠
│   │   ├── ruliweb-crawler.ts   # 루리웹
│   │   └── index.ts             # 크롤러 레지스트리
│   ├── cron/
│   │   └── auto-crawl.ts        # 자동 크롤링 스케줄러
│   ├── db/
│   │   ├── prisma.ts            # Prisma 클라이언트
│   │   └── post-service.ts      # 게시글 서비스
│   ├── types/index.ts           # TypeScript 타입
│   └── utils/index.ts           # 유틸리티 함수
├── prisma/
│   ├── schema.prisma            # DB 스키마
│   └── migrations/
└── instrumentation.ts           # 서버 시작 시 자동 크롤링 등록
```

## 새로운 크롤러 추가하기

1. `lib/crawlers/`에 크롤러 파일 생성 (`BaseCrawler` 상속)
2. `lib/crawlers/index.ts`에 등록
3. `lib/db/post-service.ts`의 `siteConfigs`에 사이트 정보 추가

```typescript
// lib/crawlers/example-crawler.ts
import { BaseCrawler } from './base-crawler';
import { type Post } from '../types';

export class ExampleCrawler extends BaseCrawler {
  siteName = 'example';

  async crawl(): Promise<Post[]> {
    // 크롤링 로직 구현
    return [];
  }
}
```

## 라이선스

MIT License
