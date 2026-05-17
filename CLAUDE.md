# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

한국 커뮤니티 사이트(22개)의 인기 게시글을 자동 크롤링하여 통합 표시하는 블로그 애그리게이터. Next.js 16 App Router 기반, 정적 JSON + CDN 아키텍처.

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

Tailwind CSS 3.4 + 다크모드는 `prefers-color-scheme` 미디어 쿼리 기반. 클래스 병합 유틸: `cn()` (`lib/utils/index.ts`).

### 디자인 시스템: "통합 커뮤니티" (Clean Modern)

**개념**: 한국 커뮤니티 콘텐츠를 편리하게 볼 수 있는 깔끔하고 읽기 쉬운 디자인. 군더더기 없는 정보 중심 레이아웃.

**타이포그래피:**
- **Font**: Geist (next/font/google) + 한글 fallback (Apple SD Gothic Neo, Pretendard, Malgun Gothic)
- **Scale**: 12 / 14 / 16 / 17 / 18 / 20 / 24 / 30px
- **Weights**: 400 (body), 500 (medium), 600 (semibold), 700 (bold)
- 한글 콘텐츠 줄높이: `leading-relaxed` (1.625)

**색상 시스템:**
- 배경: `gray-50` / `gray-900`
- 카드/네비 배경: `white` / `gray-800`
- 기본 accent: `blue-600` (#2563eb) — CTA, 활성 상태
- 테마 accent: `violet-600` (#7c3aed) — 로고 호버, 카테고리 태그
- 보조 accent: `green-600` — 사이트 필터 활성
- 커뮤니티 배지: 사이트별 tinted bg + accessible fg 쌍
- 통계 아이콘: 💬 = `orange-600`, ❤️ = `red-600`

**레이아웃:**
- max-width: `max-w-7xl` (1280px), padding: `px-4 sm:px-6 lg:px-8`
- 데스크톱: sticky top nav 56px (`h-14`)
- 모바일: fixed bottom tab bar 64px (`h-16`), `pb-32`
- 카드 간격: `space-y-1.5`

**컴포넌트 스타일:**
- **PostCard**: 1px `border-gray-200`, `rounded-lg`, `hover:bg-gray-50`, 플랫 통계
- **SiteHeader**: 1px `border-b-gray-200`, 텍스트 링크 nav, 활성 `font-semibold`
- **Banner**: `bg-blue-50 border border-blue-200 rounded-lg`
- **Pagination**: `border border-gray-200 rounded-lg` 버튼
- **Filter Pills**: `rounded-full`, 활성 `bg-blue-600` (카테고리) / `bg-green-600` (사이트)

**커뮤니티 배지 컬러 (SITE_THEME in post-card.tsx):**
- 클리앙: `#dbeafe` / `#1d4ed8`, 더쿠: `#fce7f3` / `#be185d`
- 루리웹: `#f3e8ff` / `#7e22ce`, 디시: `#dcfce7` / `#15803d`
- 인벤: `#ede9fe` / `#6d28d9`, 뽐뿌: `#ffedd5` / `#c2410c`
- (전체 22개 사이트 정의 — `components/post-card.tsx` 참조)

**클래스 유틸리티 (app/globals.css):**
- `.scrollbar-hide` - 스크롤바 숨기기 (webkit/firefox)

## 주요 주의사항

### 카테고리 필드 구분
- `post.category`: 게시판 카테고리 ("이슈", "유머", 게임명 등) — 크롤러에서 수집
- `post.siteCategory`: 사이트 카테고리 ("community", "hotdeal", "movie", "game") — siteConfigs에서 설정
- 사이트 카테고리 필터링은 반드시 `post.siteCategory` 사용

### 딜바다 인코딩
- 딜바다는 UTF-8 인코딩 사용 (EUC-KR 아님)
- `lib/crawlers/dealbada-crawler.ts`: UTF-8 우선 시도, 실패 시 EUC-KR fallback

### SLR클럽 URL
- 필수 파라미터: `id`와 `no` 모두 필요 (`lib/utils/url-normalizer.ts`)
- `id` 누락 시 "게시판 이름을 지정해 주셔야 합니다" 에러 발생

### 모바일 SVG 아이콘
- Android WebView에서 `stroke="currentColor"` + CSS 변수 조합이 동작 안 함
- 하드코딩 색상 사용: `stroke={isActive ? '#4f46e5' : '#71717a'}`

### robots.txt 준수
- `lib/utils/robots-checker.ts` + `BaseCrawler.checkRobotsTxt()` 사용
- 크롤링 전 robots.txt 확인 필수

### AdMob 광고 타이밍
- `setAdLoaded(true)` 호출을 `showBanner()` 이전에 해야 네비가 먼저 이동함
- `lib/admob.ts` 참조

## 작업 규칙

- 작업 후 CLAUDE.md의 이 파일을 갱신하지 않아도 됨 (변경 이력은 git log 참조)
- 커밋/푸시는 항상 사용자에게 확인 후 실행
- 커밋 메시지에 `Co-Authored-By` 태그 추가 금지

## Android 빌드 환경 및 버전 지침

> **반드시 읽을 것.** 이 프로젝트는 버전 불일치로 잘못된 메서드를 반복 사용한 이력이 있습니다.
> Android 코드를 작성하기 전에 아래 제약을 먼저 확인하세요.

### 빌드 툴체인 (변경 금지)

| 항목 | 값 | 위치 |
|---|---|---|
| Gradle JDK | Corretto 21.0.11 | `android/gradle.properties` > `org.gradle.java.home` |
| Gradle Wrapper | 8.14.3 | `android/gradle/wrapper/gradle-wrapper.properties` |
| AGP (Android Gradle Plugin) | 8.13.0 | `android/build.gradle` |
| compileSdkVersion | 36 (Android 16) | `android/variables.gradle` |
| targetSdkVersion | 36 (Android 16) | `android/variables.gradle` |
| minSdkVersion | 24 (Android 7.0) | `android/variables.gradle` |

- **JDK 경로**: `C:\Users\junyoung\.jdks\corretto-21.0.11`
- 시스템 기본 Java(11)는 Gradle 빌드에 사용되지 않음 — `gradle.properties`의 `org.gradle.java.home`이 우선

### targetSdkVersion ≥ 35에서 사용 금지 메서드

Android 15 (API 35)부터 back button 처리 방식이 변경됩니다. **targetSdkVersion = 36인 이 프로젝트에서는 아래가 적용됩니다.**

#### 뒤로가기 처리

```java
// ❌ 사용 금지 — targetSdk 35+에서 호출되지 않음
@Override
public void onBackPressed() { ... }

// ✅ 올바른 방법 — OnBackPressedDispatcher 사용
// super.onCreate() 이후에 추가해야 LIFO 순서로 가장 먼저 실행됨
getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
    @Override
    public void handleOnBackPressed() {
        // 뒤로가기 처리 로직
    }
});
```

**이유**: Android 15+에서는 `OnBackInvokedDispatcher`가 back 이벤트를 처리하며, `onBackPressed()`는 호출되지 않는 경우가 있음. `OnBackPressedDispatcher`는 AndroidX가 이를 추상화한 안전한 대체제.

#### WebViewClient URL 인터셉트

```java
// ❌ 비권장 (API 24에서 deprecated) — 이 시그니처만 단독 사용 금지
@Override
public boolean shouldOverrideUrlLoading(WebView view, String url) { ... }

// ✅ 올바른 방법 — WebResourceRequest 시그니처 사용
@Override
public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
    String url = request.getUrl().toString();
    if (!request.isForMainFrame()) return false; // iframe은 통과
    // 메인 프레임 URL만 처리
}
```

**이유**: API 24+ 에서 WebView는 `WebResourceRequest` 버전을 우선 호출. String 버전만 오버라이드하면 iframe 포함 모든 요청을 구분 없이 가로챌 수 있어 iframe 로딩이 차단됨.

### Capacitor 8 + Android 주의사항

- `BridgeActivity`는 `onBackPressed()`를 오버라이드하지 않음 → back button 처리는 전적으로 앱이 담당
- `this.bridge.getWebView().setWebViewClient(...)` 호출 시 Capacitor의 `BridgeWebViewClient`가 교체됨
  - `shouldInterceptRequest` (로컬 에셋 서빙) 도 사라지므로, CDN 배포 앱에서만 안전
  - `BridgeWebViewClient`를 확장하는 것이 더 안전한 방법이지만, 현재는 CDN 배포 구조라 허용
- JavaScript 이벤트 발송은 `bridge.getWebView().evaluateJavascript()`로 처리 — WebViewClient와 무관하게 동작

### Android 코드 작성 전 체크리스트

1. [ ] 사용하려는 메서드가 `minSdkVersion = 24` 이상에서 지원되는지 확인
2. [ ] 사용하려는 메서드가 `targetSdkVersion = 36` 기준으로 deprecated/removed가 아닌지 확인
3. [ ] back button 관련 코드는 반드시 `OnBackPressedDispatcher.addCallback()` 사용
4. [ ] WebViewClient 확장 시 `shouldOverrideUrlLoading(WebView, WebResourceRequest)` 사용, `isForMainFrame()` 체크

### 빌드 명령어

```bash
# 릴리즈 APK 빌드 (android/ 디렉토리에서 실행)
./gradlew assembleRelease

# 컴파일만 확인 (빠름)
./gradlew :app:compileReleaseJavaWithJavac

# 클린 빌드
./gradlew clean assembleRelease
```
