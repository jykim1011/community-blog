# 커뮤니티 통합 블로그

국내 주요 커뮤니티 사이트의 인기 게시글을 한 곳에서 모아볼 수 있는 통합 플랫폼입니다.

## 주요 기능

- 여러 커뮤니티 사이트의 베스트/인기 게시글 크롤링
- 깔끔한 UI로 게시글 통합 표시
- 사이트별 필터링
- 페이지네이션
- 원본 게시글로 바로 이동
- 다크모드 지원

## 기술 스택

### 프론트엔드
- **Next.js 16** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **React Query** - 서버 상태 관리

### 백엔드
- **Next.js API Routes** - RESTful API
- **Prisma** - ORM
- **SQLite** - 개발용 데이터베이스 (프로덕션: PostgreSQL)
- **Cheerio** - HTML 파싱
- **Axios** - HTTP 클라이언트
- **node-cron** - 스케줄링

### 지원 사이트 (현재)
- [x] 클리앙

### 향후 추가 예정 사이트
- [ ] 에펨코리아
- [ ] 더쿠
- [ ] 루리웹
- [ ] 아카라이브
- [ ] 엠팍 (엠엘비파크)
- [ ] 뽐뿌
- [ ] 인벤
- [ ] 네이트 판
- [ ] 기타 (20개 이상)

## 시작하기

### 1. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 2. 환경 변수 설정

\`.env\` 파일이 자동으로 생성되어 있습니다. 필요시 수정하세요.

\`\`\`env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRAWL_INTERVAL_MINUTES=360
CRAWL_RATE_LIMIT_MS=1000
\`\`\`

### 3. 데이터베이스 초기화

데이터베이스는 이미 초기화되어 있습니다.

\`\`\`bash
npx prisma generate
npx prisma migrate dev
\`\`\`

### 4. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

### 5. 크롤링 실행

#### 방법 1: API를 통한 수동 크롤링

\`\`\`bash
curl -X POST http://localhost:3000/api/crawl
\`\`\`

#### 방법 2: 특정 사이트만 크롤링

\`\`\`bash
curl -X POST http://localhost:3000/api/crawl \\
  -H "Content-Type: application/json" \\
  -d '{"site": "clien"}'
\`\`\`

#### 방법 3: 웹 페이지에서 버튼 클릭

첫 방문 시 "지금 크롤링 시작" 버튼을 클릭하세요.

## API 엔드포인트

### GET /api/posts
게시글 목록 조회

**쿼리 파라미터:**
- `page` - 페이지 번호 (기본값: 1)
- `limit` - 페이지당 게시글 수 (기본값: 20)
- `site` - 사이트 ID로 필터링
- `search` - 제목 검색

**예제:**
\`\`\`bash
curl "http://localhost:3000/api/posts?page=1&limit=20"
\`\`\`

### POST /api/crawl
크롤링 실행

**본문 (선택사항):**
\`\`\`json
{
  "site": "clien"
}
\`\`\`

### GET /api/sites
사이트 목록 조회

\`\`\`bash
curl "http://localhost:3000/api/sites"
\`\`\`

## 프로젝트 구조

\`\`\`
community-blog/
├── app/
│   ├── api/
│   │   ├── posts/          # 게시글 API
│   │   ├── crawl/          # 크롤링 API
│   │   └── sites/          # 사이트 API
│   ├── page.tsx            # 메인 페이지
│   └── layout.tsx          # 레이아웃
├── components/
│   ├── post-card.tsx       # 게시글 카드 컴포넌트
│   └── ui/                 # UI 컴포넌트들
├── lib/
│   ├── crawlers/           # 크롤러들
│   │   ├── base-crawler.ts
│   │   ├── clien-crawler.ts
│   │   └── index.ts
│   ├── db/                 # 데이터베이스
│   │   ├── prisma.ts
│   │   └── post-service.ts
│   ├── types/              # TypeScript 타입
│   └── utils/              # 유틸리티 함수
├── prisma/
│   ├── schema.prisma       # Prisma 스키마
│   └── migrations/         # 마이그레이션
└── public/                 # 정적 파일
\`\`\`

## 새로운 크롤러 추가하기

1. **새 크롤러 파일 생성**

\`\`\`typescript
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
\`\`\`

2. **크롤러 등록**

\`\`\`typescript
// lib/crawlers/index.ts
import { ExampleCrawler } from './example-crawler';

export const crawlers = {
  clien: new ClienCrawler(),
  example: new ExampleCrawler(), // 추가
};
\`\`\`

3. **사이트 정보 추가**

\`\`\`typescript
// lib/db/post-service.ts
const siteConfigs = {
  example: {
    displayName: '예제 사이트',
    url: 'https://example.com'
  },
};
\`\`\`

## 법적 고려사항 ⚠️

**중요:** 이 프로젝트를 사용하기 전에 다음 사항을 반드시 확인하세요:

1. **robots.txt 확인** - 각 사이트의 크롤링 허용 정책 준수
2. **이용약관 검토** - 데이터 수집 및 재배포 관련 조항 확인
3. **저작권 보호** - 게시글 전문 복사 금지, 링크만 제공
4. **출처 명시** - 모든 게시글에 출처 표시
5. **Rate Limiting** - 사이트 부하를 최소화하기 위한 요청 간격 설정

**권장 사항:**
- 게시글 제목과 링크만 표시
- 원본 사이트로 트래픽 전달
- 크롤링 간격을 충분히 길게 설정 (6시간 이상)
- 서비스 출시 전 법률 전문가 상담

## 배포

### Vercel 배포 (권장)

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정
4. 데이터베이스를 PostgreSQL로 변경

\`\`\`env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
\`\`\`

### 데이터베이스 마이그레이션

\`\`\`bash
# 프로덕션 환경에서
npx prisma migrate deploy
\`\`\`

## 향후 계획

- [ ] 더 많은 커뮤니티 사이트 추가 (22개 목표)
- [ ] 자동 스케줄링 (node-cron)
- [ ] Redis 캐싱
- [ ] 무한 스크롤
- [ ] 고급 필터링 (카테고리, 날짜 등)
- [ ] 검색 기능
- [ ] Flutter 모바일 앱 개발
- [ ] Google AdSense/AdMob 통합
- [ ] 푸시 알림
- [ ] 북마크 기능

## 라이선스

MIT License

## 기여하기

새로운 크롤러 추가, 버그 수정, 기능 개선 등의 기여를 환영합니다!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 Issue를 열어주세요.
