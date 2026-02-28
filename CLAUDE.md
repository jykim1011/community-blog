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
- **크롤링 스크립트**: `scripts/crawl.ts`가 크롤러를 직접 호출 → `data/*.json`에 저장. GitHub Actions로 15분마다 자동 실행.
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