# TODO - 커뮤니티 통합 블로그 앱 런칭

> 목표: 10M+ 다운로드에서도 월 운영비 ₩0
> 핵심: DB 없음, 서버 없음. 정적 파일 + CDN(무제한 대역폭)

---

## 아키텍처

```
GitHub Actions (크롤링, 15분 주기)
    ↓ 크롤링 결과를 JSON 파일로 생성 → git push
    ↓ push 트리거로 Cloudflare Pages 자동 빌드
Cloudflare Pages (정적 호스팅, 대역폭 무제한)
    ↓ SSG HTML + JSON 데이터 (전 세계 CDN 캐시)
┌──────────────────┬──────────────────┐
│  웹 (SSG)        │  Android 앱      │
│  → SEO 충족      │  → WebView 래핑  │
│  → AdSense       │  → AdMob         │
└──────────────────┴──────────────────┘
```

---

## 1. 정적 데이터 구조 설계 (DB → JSON 파일)
- [ ] `data/` 디렉토리 구조 설계
  - `data/posts.json` — 전체 인기글 목록 (최근 200~500건)
  - `data/sites.json` — 사이트 메타 정보
  - `data/posts/{site}.json` — 사이트별 게시글
  - `data/meta.json` — 마지막 크롤링 시각 등
- [ ] Post 타입 정의 (DB 스키마 → JSON 스키마로 변환)
- [ ] 중복 제거 로직 구현 (URL 기반, JSON 내에서 처리)
- [ ] 오래된 게시글 자동 정리 (24~48시간 이상 된 글 제거)

## 2. 크롤링 스크립트 분리
- [ ] `scripts/crawl.ts` — standalone 크롤링 스크립트 작성
  - Prisma/DB 의존성 제거
  - 크롤링 결과를 `data/*.json`에 직접 쓰기
  - 기존 JSON 읽기 → 새 글 머지 → 오래된 글 제거 → 저장
- [ ] 로컬 실행 테스트 (`npx tsx scripts/crawl.ts`)
- [ ] `instrumentation.ts` node-cron 코드 제거
- [ ] Prisma, @prisma/client 등 DB 관련 패키지 제거

## 3. GitHub Actions 크롤링 워크플로우
- [ ] `.github/workflows/crawl.yml` 작성
  ```yaml
  schedule: cron '*/15 * * * *'   # 15분마다
  jobs: crawl → npm ci → tsx scripts/crawl.ts → git commit & push
  ```
- [ ] Actions에서 `data/*.json` 변경 사항 자동 커밋
- [ ] 크롤링 실패 시 알림 (선택: GitHub Issues 자동 생성)
- [ ] 워크플로우 실행 테스트

## 4. Next.js SSG 전환 (SEO)
- [ ] DB 조회 코드 → JSON 파일 읽기로 전환
  - `postService.getPosts()` → `fs.readFile('data/posts.json')`
  - 빌드 타임에 JSON 읽어서 정적 HTML 생성
- [ ] `app/page.tsx` — `force-dynamic` 제거, SSG로 변경
- [ ] 사이트별 필터 페이지 SSG (`app/site/[name]/page.tsx`)
- [ ] `sitemap.xml` 자동 생성 (`app/sitemap.ts`)
- [ ] `robots.txt` 추가 (`app/robots.ts`)
- [ ] Open Graph / meta 태그 설정
- [ ] 구조화된 데이터 (JSON-LD) 추가
- [ ] `next.config.ts`에 `output: 'export'` 설정 (정적 빌드)

## 5. Cloudflare Pages 배포
- [ ] Cloudflare 계정 생성
- [ ] GitHub 연동 → 자동 빌드/배포 설정
- [ ] 빌드 명령: `npm run build`
- [ ] 출력 디렉토리: `out/`
- [ ] 커스텀 도메인 연결 (선택, Cloudflare DNS 무료)
- [ ] 캐시 정책 설정 (HTML: 15분, JSON: 15분, 정적자산: 1년)
- [ ] 배포 테스트 및 성능 확인

## 6. Android 앱 (Capacitor)
- [ ] Capacitor 설치 (`@capacitor/core`, `@capacitor/cli`)
- [ ] `npx cap init` — 앱 이름, 패키지명 설정
- [ ] `capacitor.config.ts`에 서버 URL 설정 (Cloudflare Pages URL)
- [ ] Android 플랫폼 추가 (`npx cap add android`)
- [ ] Android Studio에서 빌드 및 에뮬레이터 테스트
- [ ] 앱 아이콘 및 스플래시 스크린 제작
- [ ] 실기기 테스트 (APK 설치)
- [ ] 딥링크 설정 (웹 ↔ 앱 연동)

## 7. 광고 연동
- [ ] Google AdSense 계정 생성 및 사이트 등록 (웹)
- [ ] Google AdMob 계정 생성 및 앱 등록 (앱)
- [ ] 웹: AdSense 광고 코드 삽입 (헤더/게시글 사이)
- [ ] 앱: AdMob 배너/인터스티셜 광고 연동 (`@capacitor-community/admob`)
- [ ] 광고 위치 및 UX 최적화
- [ ] GDPR/개인정보 동의 배너 (광고 필수 요건)

## 8. Google Play 스토어 출시
- [ ] Google Play Developer 계정 등록 ($25 일회성)
- [ ] 앱 서명 키 생성
- [ ] Release AAB 빌드
- [ ] 스토어 등록 정보 작성 (스크린샷, 설명, 카테고리)
- [ ] 개인정보처리방침 페이지 작성 (Cloudflare Pages에 호스팅)
- [ ] 앱 심사 제출

## 9. SEO 및 마케팅
- [ ] Google Search Console 등록 및 sitemap 제출
- [ ] Google Analytics 4 연동 (또는 Cloudflare Web Analytics 무료)
- [ ] 페이지 성능 최적화 (Core Web Vitals)
- [ ] ASO (App Store Optimization) — 키워드, 설명 최적화

---

## 비용 요약

| 항목 | 무료 한도 | 10M 유저 시 |
|------|-----------|-------------|
| Cloudflare Pages | 대역폭 무제한, 빌드 500회/월 | ✅ 무료 |
| GitHub Actions | 2,000분/월 (public repo) | ✅ 무료 (크롤링 ~100분/월) |
| Cloudflare DNS | 무제한 | ✅ 무료 |
| Google Play 등록 | — | $25 일회성 |
| 도메인 (선택) | — | ~₩15,000/년 |
| **총 월 운영비** | | **₩0** |

## 스케일링 포인트

- 모든 유저가 동일한 정적 파일을 CDN에서 받음 → 유저 수와 비용 무관
- JSON 데이터 갱신은 GitHub Actions가 15분마다 push → Cloudflare 자동 재빌드
- 1명이든 1,000만명이든 서버 비용 동일 (₩0)
