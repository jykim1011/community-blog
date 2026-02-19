# TODO - 커뮤니티 통합 블로그 앱 런칭

> 목표: 10M+ 다운로드에서도 월 운영비 ₩0
> 핵심: DB 없음, 서버 없음. 정적 파일 + CDN(무제한 대역폭)

## 📊 진행 상황 (2026-02-19 업데이트)

**전체 진행률: 44% (4/9 섹션 완료)**

- ✅ 1단계: 정적 데이터 구조 설계 (100%)
- ✅ 2단계: 크롤링 스크립트 분리 (100%)
- ✅ 3단계: GitHub Actions 워크플로우 (95% - 알림 제외)
- ✅ 4단계: Next.js SSG 전환 (100%)
- ⏳ 5단계: Cloudflare Pages 배포 (0%)
- ⏳ 6단계: Android 앱 (0%)
- ⏳ 7단계: 광고 연동 (0%)
- ⏳ 8단계: Google Play 출시 (0%)
- ⏳ 9단계: SEO 및 마케팅 (0%)

**현재 상태:**
- 22개 커뮤니티 크롤러 구현 완료
- 500건 게시글 크롤링 중 (15분마다 자동 업데이트)
- GitHub Actions 자동화 완료
- 정적 빌드 준비 완료 (2.9MB)
- **다음 단계: Cloudflare Pages 배포**

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

## 1. 정적 데이터 구조 설계 (DB → JSON 파일) ✅
- [x] `data/` 디렉토리 구조 설계
  - `data/posts.json` — 전체 인기글 목록 (최근 200~500건)
  - `data/sites.json` — 사이트 메타 정보
- [x] Post 타입 정의 (DB 스키마 → JSON 스키마로 변환)
  - `StaticPost`, `StaticSite` 타입 정의 완료
- [x] 중복 제거 로직 구현 (URL 기반, JSON 내에서 처리)
  - `scripts/crawl.ts`에서 URL 기반 중복 제거
- [x] 오래된 게시글 자동 정리 (24~48시간 이상 된 글 제거)
  - 48시간 초과 게시글 자동 제거 구현

## 2. 크롤링 스크립트 분리 ✅
- [x] `scripts/crawl.ts` — standalone 크롤링 스크립트 작성
  - Prisma/DB 의존성 제거 완료
  - 크롤링 결과를 `data/*.json`에 직접 쓰기
  - 기존 JSON 읽기 → 새 글 머지 → 오래된 글 제거 → 저장
  - 22개 커뮤니티 크롤러 구현 완료
- [x] 로컬 실행 테스트 (`npx tsx scripts/crawl.ts`)
  - 테스트 완료: 443건 → 500건 크롤링 성공
- [x] `instrumentation.ts` node-cron 코드 제거
  - 파일 삭제 완료
- [x] Prisma, @prisma/client 등 DB 관련 패키지 제거
  - package.json에서 완전 제거 완료

## 3. GitHub Actions 크롤링 워크플로우 ✅
- [x] `.github/workflows/crawl.yml` 작성
  ```yaml
  schedule: cron '*/15 * * * *'   # 15분마다
  jobs: crawl → npm ci → tsx scripts/crawl.ts → git commit & push
  ```
- [x] Actions에서 `data/*.json` 변경 사항 자동 커밋
  - 자동 커밋 메시지: "chore: update crawled data [skip ci]"
- [ ] 크롤링 실패 시 알림 (선택: GitHub Issues 자동 생성)
  - 미구현 (선택 사항)
- [x] 워크플로우 실행 테스트
  - 수동 트리거 테스트 성공 (1분 18초, 500건 크롤링)

## 4. Next.js SSG 전환 (SEO) ✅
- [x] DB 조회 코드 → JSON 파일 읽기로 전환
  - `import postsData from '@/data/posts.json'` 사용
  - 빌드 타임에 JSON 읽어서 정적 HTML 생성
- [x] `app/page.tsx` — `force-dynamic` 제거, SSG로 변경
  - 완전 정적 페이지 생성 (23개 페이지)
- [x] 사이트별 필터 페이지 SSG (`app/site/[name]/page.tsx`)
  - `generateStaticParams()` 구현 (17개 사이트)
- [x] `sitemap.xml` 자동 생성 (`app/sitemap.ts`)
  - 홈 + 17개 사이트 페이지 sitemap 생성
- [x] `robots.txt` 추가 (`app/robots.ts`)
  - 검색엔진 크롤러 허용 설정
- [x] Open Graph / meta 태그 설정
  - `app/layout.tsx`에 전역 메타데이터 설정
- [x] 구조화된 데이터 (JSON-LD) 추가
  - WebSite, CollectionPage 스키마 구현
- [x] `next.config.ts`에 `output: 'export'` 설정 (정적 빌드)
  - 빌드 결과물: 2.9MB (out/ 디렉토리)

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
