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
- **클라이언트 사이드 필터/페이지네이션**: `components/post-list.tsx`에서 useState로 사이트 필터, 페이지네이션 처리.
- **크롤링 스크립트**: `scripts/crawl.ts`가 크롤러를 직접 호출 → `data/*.json`에 저장. GitHub Actions로 15분마다 자동 실행.
- **크롤러 패턴**: `BaseCrawler` 추상 클래스를 상속. `lib/crawlers/index.ts`의 레지스트리에 등록. Cheerio로 HTML 파싱.

## 새 크롤러 추가 절차

1. `lib/crawlers/`에 `BaseCrawler` 상속 클래스 생성
2. `lib/crawlers/index.ts`의 `crawlers` 레코드에 등록
3. `scripts/crawl.ts`의 `siteConfigs`에 사이트 설정 추가

## 경로 별칭

`@/*` → 프로젝트 루트 (`./`). import 시 `@/lib/...`, `@/components/...` 형태로 사용.

## 스타일링

Tailwind CSS 3.4 사용. 커스텀 테마 확장 없음 (기본 테마). 다크모드는 `prefers-color-scheme` 미디어 쿼리 기반. 클래스 병합 유틸: `cn()` (`lib/utils/index.ts`).
