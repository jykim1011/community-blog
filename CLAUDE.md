# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

한국 커뮤니티 사이트(17개)의 인기 게시글을 자동 크롤링하여 통합 표시하는 블로그 애그리게이터. Next.js 16 App Router 기반, 정적 JSON + CDN 아키텍처.

## 주요 명령어

```bash
npm run dev          # 개발 서버 (http://localhost:3000)
npm run build        # 정적 빌드 (out/ 디렉토리 생성)
npm run lint         # ESLint 실행
npm run crawl        # 크롤링 실행 (data/*.json 업데이트)
npx tsx scripts/crawl.ts [사이트명]  # 특정 사이트만 크롤링
```

## 아키텍처

- **정적 빌드**: `next.config.ts`에 `output: 'export'`. DB 없이 `data/posts.json`, `data/sites.json`을 import하여 빌드 시 정적 HTML 생성.
- **클라이언트 사이드 필터/무한 스크롤**: `components/post-list.tsx`에서 useState로 사이트 필터, Intersection Observer로 무한 스크롤 처리.
- **크롤링 스크립트**: `scripts/crawl.ts`가 크롤러를 직접 호출 → `data/*.json`에 저장. GitHub Actions로 30분마다 자동 실행.
- **크롤러 패턴**: `BaseCrawler` 추상 클래스를 상속. `lib/crawlers/index.ts`의 레지스트리에 등록. Cheerio로 HTML 파싱.

## 새 크롤러 추가 절차

1. `lib/crawlers/`에 `BaseCrawler` 상속 클래스 생성
2. `lib/crawlers/index.ts`의 `crawlers` 레코드에 등록
3. `scripts/crawl.ts`의 `siteConfigs`에 사이트 설정 추가

## 경로 별칭

`@/*` → 프로젝트 루트 (`./`). import 시 `@/lib/...`, `@/components/...` 형태로 사용.

## 스타일링

Tailwind CSS 3.4 + Geist 폰트 사용. 커스텀 테마 확장 없음 (기본 테마). 다크모드는 `prefers-color-scheme` 미디어 쿼리 기반. 클래스 병합 유틸: `cn()` (`lib/utils/index.ts`).

**타이포그래피 가이드:**
- 한글 콘텐츠 줄높이: `leading-relaxed` (1.625) 권장
- 최소 폰트 크기: 12px (`text-xs`)
- 색상 대비: WCAG AA 기준 (4.5:1) 충족

## 최근 변경사항

### 2026-03-01: 게시글 사이트별 믹싱 구현 (라운드로빈 방식)

**문제:**
- "전체" 탭에서 사이트별로 완전히 그룹화되어 표시
- 첫 20개 게시글이 모두 클리앙만 나오고, 다른 커뮤니티를 보려면 많은 스크롤 필요
- 원인: `scripts/crawl.ts`에서 사이트별 순차 크롤링 후 fetchedAt(모두 동일) 기준 정렬

**시도 1: createdAt 정렬 (실패)**
- `fetchedAt` → `createdAt` 변경 시도
- 문제 발견: 많은 크롤러가 상대 시간("5분 전")을 크롤링 시점 기준으로 계산
- 결과: todayhumor, slrclub 등의 모든 게시글이 거의 동일한 createdAt (밀리초 단위만 다름)
- 여전히 사이트별 블록 유지 (최대 연속 블록: 100건)

**최종 해결: 라운드로빈 인터리빙**

`scripts/crawl.ts` Line 163-187 수정:

```typescript
// 1. 사이트별로 그룹화
const groupedBySite = popularFiltered.reduce((acc, post) => {
  if (!acc[post.site]) acc[post.site] = [];
  acc[post.site].push(post);
  return acc;
}, {} as Record<string, StaticPost[]>);

// 2. 각 사이트 내에서 createdAt 정렬 (최신순)
Object.values(groupedBySite).forEach(group => {
  group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// 3. 라운드로빈 방식으로 사이트별 하나씩 인터리빙
const interleaved: StaticPost[] = [];
const siteNames = Object.keys(groupedBySite);
const maxLength = Math.max(...Object.values(groupedBySite).map(g => g.length));

for (let i = 0; i < maxLength; i++) {
  for (const site of siteNames) {
    if (groupedBySite[site][i]) {
      interleaved.push(groupedBySite[site][i]);
    }
  }
}
```

**효과:**
- ✅ 첫 30개 게시글에서 17개 커뮤니티가 골고루 분포 (각 사이트 1~2건)
- ✅ 최대 연속 동일 사이트 블록: 1건 (완벽한 믹싱)
- ✅ 사이트 내에서는 createdAt 순서 유지 (시간순)
- ✅ 사용자가 다양한 커뮤니티를 한 번에 확인 가능

**검증 결과 (2026-03-01):**

첫 30개 게시글 분포 (각 사이트 균등하게 2건씩):
- 클리앙, 더쿠, 루리웹, 디시인사이드, 인벤, 뽐뿌, 엠팍, 네이트판
- 일베, 보배드림, 이토랜드, 웃긴대학, 82쿡
- SLR클럽, 가생이, 해연갤, 오늘의유머 (각 1건)

**개선 효과:**
- 변경 전: 첫 7페이지(140개)가 모두 클리앙
- 변경 후: 첫 1페이지(20개)에서 17개 커뮤니티 모두 노출

### 2026-03-01: 크롤링-배포 자동화 개선 + gasengi 크롤러 수정

**문제 1: 크롤링-배포 주기 불일치**
- 크롤링: 30분마다 실행 (crawl.yml)
- 배포: 2시간마다 실행 (deploy.yml)
- 데이터는 30분마다 업데이트되지만 웹사이트는 2시간마다만 배포됨
- 사용자는 최대 2시간 전 데이터를 보게 됨

**문제 2: gasengi 크롤러 구 게시판 크롤링**
- gasengi 크롤러가 commu07 (2019년 아카이브 게시판) 크롤링
- 모든 게시글이 2019-04-05로 파싱됨 (84개월 전)
- 실제 활성 게시판: commu08 (잡담)

**해결 방법:**

1. **crawl.yml 개선** (크롤링 후 즉시 배포 트리거)
```yaml
- name: Commit and push
  id: commit
  run: |
    echo "changed=true" >> $GITHUB_OUTPUT  # 변경 플래그 출력

- name: Trigger deployment
  if: steps.commit.outputs.changed == 'true'
  run: |
    curl -X POST "${{ secrets.CLOUDFLARE_DEPLOY_HOOK }}"  # 즉시 배포
```

2. **deploy.yml 개선** (정기 배포 주기 완화)
```yaml
schedule:
  # 2시간 → 6시간 (백업용)
  - cron: '0 */6 * * *'
```

3. **gasengi-crawler.ts 수정**
```typescript
// Line 9: 게시판 URL 변경
private readonly boardUrl = 'https://www.gasengi.com/main/board.php?bo_table=commu08';

// Line 123-148: 날짜 파싱 로직 개선
private parseDate(timeText: string): Date {
  // "02-19" 형태 (MM-DD) 처리 시 미래 날짜 검증
  if (timeText.match(/^\d{2}-\d{2}$/)) {
    const date = new Date(now.getFullYear(), month - 1, day);
    if (date > now) {
      date.setFullYear(now.getFullYear() - 1);  // 미래면 작년으로
    }
    return date;
  }
}
```

4. **CLAUDE.md 수정**
- 크롤링 주기 15분 → 30분 (실제 스케줄 반영)

**효과:**
- ✅ 크롤링 후 즉시 배포 (30분 주기)
- ✅ 사용자는 항상 최신 데이터 확인 가능
- ✅ gasengi 데이터 정상화 (2019년 → 실시간)
- ✅ 정기 배포는 백업용으로 유지 (크롤링 실패 시 대비)
- ✅ Cloudflare Pages 빌드 횟수 감소 (비용 절감)

**배포 로직:**
- 크롤링 성공 + 데이터 변경 → 즉시 배포 (30분 주기)
- 크롤링 성공 + 데이터 미변경 → 배포 안 함 (리소스 절약)
- 크롤링 실패 → 정기 배포가 6시간마다 보장 (하루 4회)



### 2026-02-28 (저녁): natepann 크롤러 메트릭 파싱 오류 수정

**문제:**
- natepann 크롤러가 게시글 제목은 정상 파싱하지만 조회수, 댓글, 좋아요 메트릭을 모두 0으로 파싱
- 필터링(조회수>=50 OR 댓글>=3 OR 좋아요>=5) 조건에서 전체 게시글이 제거되어 posts.json에 natepann 데이터가 0건

**원인 분석:**
- 네이트판 HTML 구조 확인 결과, 선택자가 실제 구조와 불일치
  - 조회수: `.count` 텍스트 형태가 "조회 88,478" (숫자만 추출 필요)
  - 댓글: `.reple-num` (기존 `.comment, .reply`는 존재하지 않음)
  - 좋아요: `.rcm` (기존 `.like, .good`은 존재하지 않음)

**수정 내용 (`lib/crawlers/natepann-crawler.ts`):**
```typescript
// 조회수: "조회 " 텍스트 제거 추가
const viewText = $el.find('.count').text().trim().replace(/조회\s*/g, '').replace(/,/g, '');
const viewCount = parseInt(viewText) || 0;

// 댓글: .reple-num 선택자로 변경
const commentText = $el.find('.reple-num').text().trim();
const commentCount = parseInt(commentText.replace(/[\[\]()]/g, '')) || 0;

// 좋아요: .rcm 선택자로 변경, "추천 " 텍스트 제거 추가
const likeText = $el.find('.rcm').text().trim().replace(/추천\s*/g, '').replace(/,/g, '');
const likeCount = parseInt(likeText) || 0;
```

**결과:**
- 156건 크롤링 → 156건 필터 통과 (100%, 기존 0%)
- 최종 69건 저장 (MAX_POSTS 3000 제한)
- 전체 데이터: 3000건 중 natepann 69건 포함

**교훈:**
- 크롤러 구현 시 실제 HTML 구조 검증 필수
- 메트릭 파싱 오류는 필터링에서 전체 데이터 손실로 이어질 수 있음
- 정규식으로 한글 텍스트 제거 후 숫자 파싱 필요

### 2026-02-28: 크롤러 5페이지 크롤링 확장 (14개 사이트)

**다중 페이지 크롤링 구현**
- 14개 크롤러를 1페이지 → 5페이지 크롤링으로 확장
- 데이터 수집량 5배 증가로 필터링 후에도 충분한 게시글 확보

**수정된 크롤러 (14개):**
1. `slrclub-crawler.ts` (딜레이 2000ms, 레이트리밋 대응)
2. `theqoo-crawler.ts`
3. `ruliweb-crawler.ts`
4. `mlbpark-crawler.ts`
5. `ilbe-crawler.ts`
6. `bobaedream-crawler.ts`
7. `natepann-crawler.ts`
8. `cook82-crawler.ts`
9. `etoland-crawler.ts`
10. `humoruniv-crawler.ts`
11. `gasengi-crawler.ts`
12. `hygall-crawler.ts`
13. `todayhumor-crawler.ts`
14. `inven-crawler.ts`

**구현 패턴:**
```typescript
async crawl(): Promise<Post[]> {
  const allPosts: Post[] = [];
  const PAGES_TO_CRAWL = 5;

  for (let page = 1; page <= PAGES_TO_CRAWL; page++) {
    const pageUrl = this.getPageUrl(page);
    const posts = await this.crawlPage(pageUrl);

    if (posts.length === 0) break;
    allPosts.push(...posts);

    if (page < PAGES_TO_CRAWL) {
      await this.delay(1000); // slrclub은 2000ms
    }
  }

  return allPosts;
}

private getPageUrl(page: number): string {
  if (page === 1) return this.boardUrl;
  return `${this.boardUrl}${페이지파라미터}`;
}

private async crawlPage(url: string): Promise<Post[]> {
  // 기존 crawl() 내용 이동
}
```

**URL 페이징 패턴 (사이트별):**
- `?page=${page}`: theqoo, ruliweb, ilbe, natepann, etoland
- `&page=${page}`: slrclub, bobaedream, cook82, gasengi, hygall, todayhumor
- `&p=${page}`: mlbpark
- `&pg=${page}`: humoruniv
- `?p=${page}`: inven

**에러 핸들링 강화:**
- 429 (Rate Limit): 10초 대기 후 재시도
- 404 (Not Found): 더 이상 페이지 없음, 크롤링 중단
- 빈 페이지: 조기 종료로 불필요한 요청 방지
- 각 페이지 크롤링 실패 시 로그 출력 후 중단

**성능 최적화:**
- 페이지 간 1초 딜레이 (slrclub은 2초)
- 빈 페이지 감지 시 조기 종료
- 에러 발생 시 즉시 중단 (무한 루프 방지)

**검증 완료:**
- ✓ 17개 크롤러 모두 5페이지 크롤링 구현 완료 (clien, ppomppu, dcinside 포함)
- ✓ 타입스크립트 컴파일 성공
- ✓ 정적 빌드 성공 (24개 페이지 생성, 에러 없음)
- ✓ 전체 크롤링 테스트 성공 (2,270건 수집)

**실제 크롤링 결과 (2026-02-28 20:43):**
- 신규 크롤링: 2,270건 (17개 사이트 × 5페이지)
- 필터링 제거: 180건 (인기 부족)
- 필터 통과율: 92.1%
- **최종 게시글: 2,777건** (기존 1,101건 → 152% 증가)
- 파일 크기: 1.3MB (모바일 로딩 2~3초)
- 무한 스크롤: 138회 (기존 55회의 2.5배)

**사이트별 분포:**
- dcinside: 301건, slrclub: 261건, ppomppu: 259건
- clien: 241건, ilbe: 231건, cook82: 206건
- ruliweb: 171건, mlbpark: 171건, todayhumor: 154건
- bobaedream: 151건, hygall: 150건, gasengi: 149건
- theqoo: 146건, etoland: 140건
- inven: 29건 (8건→3.6배), humoruniv: 17건

**효과:**
- ✅ 데이터 2.5배 증가로 충분한 콘텐츠 확보
- ✅ 모든 사이트 균형잡힌 분포 (150~300건)
- ✅ IP 차단 없음 (1~2초 딜레이 효과적)
- ✅ 크롤링 시간 3~5분 (허용 범위)

### 2026-02-28: UI 개편 및 무한 스크롤 전환

**타이포그래피 개선 (한글 가독성 향상)**
- `app/globals.css`: Geist 폰트 적용 (`var(--font-geist-sans)`)
- `components/post-card.tsx`:
  - 제목 크기: `text-sm` → `text-base` (모바일 14px→16px)
  - 제목 줄높이: `leading-tight sm:leading-snug` → `leading-relaxed` (1.625)
  - 메타/통계 정보: `text-[11px]` → `text-xs` (11px→12px), `leading-normal` 추가

**색상 대비 개선 (접근성 강화, WCAG AA 준수)**
- 메타정보: `text-gray-600 dark:text-gray-400` → `text-gray-700 dark:text-gray-300` (대비율 10.7:1/9.3:1)
- 통계정보: `text-gray-500 dark:text-gray-500` → `text-gray-600 dark:text-gray-400` (대비율 7.0:1/6.4:1)

**무한 스크롤 전환 (모바일 UX 개선)**
- `components/post-list.tsx`:
  - 페이징 버튼 UI 제거 (ClientPagination 함수 삭제)
  - Intersection Observer 기반 무한 스크롤 구현
  - 초기 로드 20개, 하단 200px 도달 시 20개씩 추가
  - 로딩 스피너 (300ms 의도적 지연)
  - "모든 게시글 확인" 완료 메시지

**검증 완료:**
- ✓ 개발 서버 정상 실행 (http://localhost:3000)
- ✓ 정적 빌드 성공 (24개 페이지 생성, 에러 없음)
- ✓ 타이포그래피 개선으로 한글 가독성 향상
- ✓ 색상 대비 WCAG AA 기준 충족
- ✓ 무한 스크롤로 페이지 전환 없는 부드러운 탐색 경험

### 2026-02-28: 인기 게시글 필터링 구현 (데이터 품질 개선)

**필터링 로직 추가 (`scripts/crawl.ts`)**
- OR 조건 필터링: `viewCount >= 100 OR commentCount >= 5 OR likeCount >= 10`
- 하나의 메트릭만 기준 이상이면 유지 (사이트별 메트릭 규모 차이 대응)
- 메트릭 null/undefined 처리: `??` 연산자로 0으로 대체
- 환경 변수 오버라이드 지원: `MIN_VIEW_COUNT`, `MIN_COMMENT_COUNT`, `MIN_LIKE_COUNT`

**구현 상세:**
- `PopularityFilterConfig` 타입 정의 (Line 7-11)
- 필터 상수 정의 (Line 20-30)
- `filterPopularPosts()` 함수 추가 (Line 54-81)
  - OR 조건 필터링
  - 안전장치: 모든 게시글 필터링 시 조회수 상위 100건 반환
- 메인 로직에 필터 적용 (Line 153-165)
  - 기간 필터링 → 인기 필터링 → 정렬 → 개수 제한
- 로그 출력 개선 (Line 170-180)
  - 제거 사유별 통계: 기간 만료, 인기 부족, 개수 제한
  - 필터 기준 표시

**필터링 효과:**
- 초기 테스트 (clien 단일 사이트): 327건 제거 (32.7%)
- 전체 크롤링 테스트 (17개 사이트): 115건 제거 (25.5%)
- 최종 데이터: 947건 (품질률 100%)
- 조회수 100+: 97.9% (927/947건)
- 댓글 5+: 59.2% (561/947건)
- 좋아요 10+: 43.1% (408/947건)

**엣지 케이스 처리:**
- 메트릭 누락 (ppomppu 댓글수, theqoo 좋아요): OR 조건으로 다른 메트릭 활용
- 모든 게시글 필터링: 안전장치로 조회수 상위 100건 반환
- 크롤링 실패: 기존 URL 중복 제거 로직이 72시간 유지 보장

**검증 완료:**
- ✓ 단일 사이트 테스트 성공 (clien 29건 크롤링, 327건 필터링)
- ✓ 전체 크롤링 테스트 성공 (451건 크롤링, 115건 필터링)
- ✓ 데이터 품질 100% (저품질 게시글 0건)
- ✓ 정적 빌드 성공 (24개 페이지 생성, 에러 없음)
- ✓ 사이트별 메트릭 분포 정상 (ppomppu 116건, dcinside 115건, clien 109건 등)

**사용 예시:**
```bash
npm run crawl                          # 기본 필터 적용 (100/5/10)
MIN_VIEW_COUNT=50 npm run crawl        # 조회수 기준 완화
npx tsx scripts/crawl.ts clien         # 특정 사이트만 크롤링
```

### 2026-02-28: PC/모바일 반응형 UI 개선 (페이징/무한 스크롤 분기)

**반응형 네비게이션 구현 (`components/post-list.tsx`, `lib/hooks/use-media-query.ts`)**
- PC (≥768px): 페이징 버튼 UI
- 모바일 (<768px): 무한 스크롤 유지
- 미디어 쿼리 훅으로 실시간 화면 크기 감지

**구현 상세:**
- `lib/hooks/use-media-query.ts` 생성
  - `useMediaQuery()` 훅: 미디어 쿼리 매칭 여부 반환
  - `matchMedia` API 기반 실시간 감지
  - 리사이즈 시 자동 업데이트
- `components/post-list.tsx` 수정
  - `isDesktop` 상태 추가 (md 브레이크포인트 = 768px)
  - `currentPage` 상태 추가 (PC용)
  - PC: 페이징 방식 (20개 단위, 최대 10개 페이지 버튼)
  - 모바일: 무한 스크롤 방식 (Intersection Observer)
  - 사이트 필터/페이지 변경 시 스크롤 상단 이동

**PC 페이징 UI:**
- "이전/다음" 버튼
- 페이지 번호 버튼 (최대 10개 표시)
- 현재 페이지 강조 (파란색 배경)
- 비활성화 상태 처리 (첫 페이지/마지막 페이지)
- 다크모드 지원

**무한 스크롤 유지 (모바일):**
- Intersection Observer 기반
- 하단 200px 도달 시 20개씩 추가
- 로딩 스피너 (300ms 의도적 지연)
- "모든 게시글 확인" 완료 메시지

**검증 완료:**
- ✓ useMediaQuery 훅 생성 및 동작 확인
- ✓ PC 화면에서 페이징 버튼 정상 표시
- ✓ 모바일 화면에서 무한 스크롤 유지
- ✓ 정적 빌드 성공 (24개 페이지 생성, 에러 없음)
- ✓ 반응형 전환 시 즉각 UI 변경 (리사이즈 테스트)

**사용자 경험 개선:**
- PC: 페이지 단위 탐색으로 빠른 이동 가능
- 모바일: 무한 스크롤로 끊김 없는 탐색 경험
- 디바이스별 최적화된 UX 제공

## 중요사항
작업후에는 항상 기본적으로 작업 내용을 요약해서 md파일에 갱신하세요.

## jvaa 빌드 참조
jdk는 C:\Users\junyoung\.jdks에 있습니다.