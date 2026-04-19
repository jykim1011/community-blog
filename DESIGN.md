# Design System: "통합 커뮤니티" — Clean Dashboard

## 개요

한국 커뮤니티 콘텐츠를 편리하게 소비할 수 있는 깔끔하고 정보 중심의 대시보드 디자인.
군더더기 없는 레이아웃, 일관된 CSS 변수 시스템, 22개 사이트 브랜드 색상 체계.

---

## 폰트

```css
--font-sans: "Pretendard Variable", Pretendard, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, Menlo, monospace;
```

- **Pretendard Variable** (CDN): 본문·UI 전체
- **JetBrains Mono**: 숫자 통계, 코드
- `word-break: keep-all` — 한국어 줄바꿈 최적화

### 타이포그래피 스케일

| 용도 | 크기 | Weight |
|------|------|--------|
| 사이트 제목 | 18–20px | 700 |
| 섹션 헤더 | 15–16px | 600 |
| 게시글 제목 | 14px | 500 |
| 메타 정보 | 12px | 400 |
| 레이블/배지 | 10–11px | 500–600 |

---

## 색상 시스템 (CSS 변수)

### 라이트 모드

```css
--bg:        #fafafa;
--surface:   #ffffff;
--surface-2: #f4f4f5;
--hover:     #f4f4f5;
--border:    #e4e4e7;
--border-hv: #d4d4d8;

--fg:   #09090b;
--fg-1: #27272a;
--fg-2: #52525b;
--fg-3: #71717a;
--fg-4: #a1a1aa;

--accent:      #4f46e5;   /* Indigo 600 — CTA, 활성 상태 */
--accent-2:    #4338ca;
--accent-tint: #eef2ff;
--accent-fg:   #ffffff;

--pos:  #10b981;   /* 초록 — 사이트 필터 활성, 온라인 표시 */
--warn: #f59e0b;
--hot:  #ef4444;
```

### 다크 모드 (`prefers-color-scheme: dark`)

```css
--bg:        #0a0a0b;
--surface:   #141416;
--surface-2: #1c1c1f;
--hover:     #1c1c1f;
--border:    #27272a;
--border-hv: #3f3f46;
--fg:        #fafafa;
--fg-1:      #e4e4e7;
--fg-2:      #a1a1aa;
--fg-3:      #71717a;
--fg-4:      #52525b;
--accent-tint: rgba(79,70,229,.15);
```

---

## 레이아웃

### 데스크톱: 3컬럼 대시보드

```
┌──────┬────────────────┬───────────────────────────────┐
│ Rail │   Sidebar      │        Main Content           │
│ 72px │   240px        │         flex-1                │
└──────┴────────────────┴───────────────────────────────┘
```

- **Rail** (`--rail-w: 72px`): 로고 + 아이콘 네비게이션, sticky
- **Sidebar** (`--sidebar-w: 240px`): 카테고리별 커뮤니티 목록 + 게시글 수, sticky
- **Main**: TopBar(sticky) + StatsBar + 피드·트렌드 2열 그리드

### 모바일: 단일 컬럼

- 상단 sticky 토글 바 (사이트명 + LIVE 표시)
- 피드 카드 (`rounded-xl`, `--surface` 배경)
- 하단 고정 탭 바 60px + safe-area-inset

---

## 컴포넌트

### PostRow (게시글 카드)

```
┌─ 3px 컬러바 ─┬──────────────────────────────────┐
│   brand hex  │ 사이트명  · 시간  · 👁 조회  · 💬  │
│              │ [카테고리칩] 게시글 제목 제목 제목  │
│              │ ❤️ 좋아요                          │
└──────────────┴──────────────────────────────────┘
```

- Grid: `3px 1fr`
- 좌측 컬러 바: 사이트별 브랜드 hex (아래 참조)
- 카테고리 칩: `--accent-tint` 배경 + `--accent` 색상
- 읽은 글: 제목 색상 `--fg-3` (회색 처리)
- Hover: `--hover` 배경색 전환

### 필터 Pill 버튼

```tsx
// 활성
{ background: 'var(--accent)', color: '#fff' }   // 카테고리
{ background: 'var(--pos)',    color: '#fff' }   // 사이트

// 비활성
{ background: 'var(--surface-2)', color: 'var(--fg-2)' }
```

- `rounded-full`, `text-xs`, `px-3 py-1.5`
- 가로 스크롤 (`overflow-x-auto scrollbar-hide`)

### 모바일 하단 탭 바

```css
height: 60px;
background: var(--surface);
border-top: 1px solid var(--border);
padding-bottom: max(env(safe-area-inset-bottom), 0px);
```

활성 아이콘: `var(--accent)` / 비활성: `var(--fg-3)`

### 데스크톱 Rail 버튼

- 활성: `var(--accent-tint)` 배경 + `var(--accent)` 색상 + 좌측 2px 인디케이터 바
- 비활성: transparent → hover 시 `var(--hover)`

---

## 사이트 브랜드 색상 (22개)

| 사이트 | Hex | 도메인 |
|--------|-----|--------|
| 클리앙 | `#475569` | clien.net |
| 더쿠 | `#d6006c` | theqoo.net |
| 루리웹 | `#c81e1e` | ruliweb.com |
| 디시인사이드 | `#d1410c` | dcinside.com |
| 인벤 | `#b4530b` | inven.co.kr |
| 뽐뿌 | `#a16207` | ppomppu.co.kr |
| 엠팍 | `#0b3b5c` | mlbpark.donga.com |
| 네이트판 | `#c92b2b` | pann.nate.com |
| 일베 | `#455a64` | ilbe.com |
| 보배드림 | `#1e3a8a` | bobaedream.co.kr |
| 이토랜드 | `#1f6b2a` | etoland.co.kr |
| 웃긴대학 | `#1b4a9e` | web.humoruniv.com |
| 82쿡 | `#b02727` | 82cook.com |
| SLR클럽 | `#2d3a4a` | slrclub.com |
| 가생이 | `#1e6b31` | gasengi.com |
| 해연갤 | `#7a2a94` | gall.dcinside.com |
| 오늘의유머 | `#5e6b10` | todayhumor.co.kr |
| 쿼사존 | `#c2410c` | quasarzone.com |
| 딜바다 | `#854d0e` | dealbada.com |
| DVDPrime | `#4338ca` | dvdprime.com |
| 쿨엔조이 | `#0f766e` | coolenjoy.net |
| 익스트림무비 | `#7e22ce` | extmovie.com |

파비콘: `https://www.google.com/s2/favicons?domain={도메인}&sz=32` (14×14px)

---

## 반응형

| 구간 | 레이아웃 |
|------|---------|
| `< 640px` (sm) | 단일 컬럼, 하단 탭 바 60px |
| `≥ 640px` | 3컬럼 대시보드, 데스크톱 Rail + Sidebar |

- 모바일 콘텐츠 하단 패딩: `calc(60px + safe-area-inset-bottom)`
- 설정 페이지 모바일 하단: `pb-24`

---

## 그림자 / 레이디어스

```css
--radius:    10px;
--radius-lg: 14px;
--radius-xl: 20px;

--shadow-sm: 0 1px 2px rgba(9,9,11,.04);
--shadow:    0 1px 3px rgba(9,9,11,.06), 0 1px 2px rgba(9,9,11,.04);
--shadow-lg: 0 10px 30px -10px rgba(9,9,11,.12), 0 4px 10px -4px rgba(9,9,11,.08);
```

---

## 유틸리티

```css
.scrollbar-hide   /* 스크롤바 숨김 (webkit + firefox) */
.font-mono        /* JetBrains Mono */
.tabular-nums     /* 숫자 고정폭 */
```

---

**버전**: 2.0 (2026-04-19)
**이전 버전**: Neo-Brutalist "Digital Street Culture" (v1.0, 제거됨)
