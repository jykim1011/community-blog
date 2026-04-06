# 바이브코딩으로 한국 커뮤니티 통합 앱 만들기

## 소개

### 시도하고자 했던 것과 그 이유

요즘 유행하는 **바이브코딩(AI 코딩 어시스턴트와 대화하며 개발)**으로 실제 앱 출시가 가능한지 시도해 보고 싶었습니다.

**목표:**
- 17개 한국 커뮤니티(클리앙, 더쿠, 루리웹, 디시인사이드 등)의 인기 게시글을 한 곳에서 볼 수 있는 앱
- Next.js 정적 빌드 + Cloudflare Pages 배포 (완전 무료)
- 30분마다 자동 크롤링 (GitHub Actions)
- 웹 + 안드로이드 앱 모두 지원

**결과:**
- ✅ 웹사이트 배포 성공
- ✅ 안드로이드 앱 Play Store 출시 성공
- ✅ 광고 수익화까지 완료
- ✅ **총 개발 기간: 약 2주**

---

## 진행 방법

### 사용한 도구

1. **Claude Code (CLI)** - 초반 구조 설계 및 크롤러 구현
2. **Cursor** - 후반부 UI 개선 (코드 구조 시각화 필요)
3. **GitHub Actions** - 자동 크롤링 스케줄링
4. **Cloudflare Pages** - 무료 호스팅

### 주요 프롬프트 전문

#### 1. 프로젝트 초기 설정 (2026-02-28)

```
Next.js 16 App Router로 한국 커뮤니티 통합 블로그를 만들고 싶어.

요구사항:
1. 17개 커뮤니티 사이트를 크롤링해서 인기 게시글 수집
2. 정적 빌드 (output: 'export')로 DB 없이 JSON 파일 기반
3. 크롤링 스크립트는 별도로 실행 (scripts/crawl.ts)
4. BaseCrawler 추상 클래스를 만들고, 각 사이트별로 상속받아 구현
5. Cheerio로 HTML 파싱
6. 사이트 필터, 무한 스크롤 기능 포함

프로젝트 구조를 설계해줘.
```

#### 2. 크롤러 다중 페이지 확장 (2026-02-28)

```
현재 각 크롤러가 1페이지만 크롤링하는데, 5페이지까지 확장하고 싶어.

요구사항:
1. 모든 크롤러에 for 루프로 5페이지 크롤링
2. 페이지 간 1초 딜레이 (레이트리밋 대응)
3. 429 에러 시 10초 대기 후 재시도
4. 빈 페이지 감지 시 조기 종료
5. 각 사이트의 URL 페이징 패턴에 맞게 구현
   - ?page=, &page=, &p=, &pg= 등

14개 크롤러를 한 번에 수정해줘:
- slrclub, theqoo, ruliweb, mlbpark, ilbe, bobaedream
- natepann, cook82, etoland, humoruniv, gasengi
- hygall, todayhumor, inven
```

#### 3. UI 색상 시스템 개선 (2026-03-12)

```
Google Stitch처럼 시각적으로 개선하고 싶어.

요구사항:
1. 17개 커뮤니티마다 고유한 색상 테마 부여
   - 클리앙: 파랑, 더쿠: 핑크, 루리웹: 보라 등
2. 라이트/다크 모드 모두 지원
3. 커뮤니티 이름을 색상 배지로 표시
4. 메트릭에 아이콘 추가 (👁️ 조회수, 💬 댓글, ❤️ 좋아요)
5. 정렬 기능 추가 (인기순, 댓글순, 최신순)

lib/utils/site-colors.ts 파일을 만들고,
PostCard와 PostList 컴포넌트를 개선해줘.
```

#### 4. 날짜 파싱 버그 수정 (2026-03-02)

```
클리앙 크롤러에서 모든 게시글의 날짜가 크롤링 시점으로 표시돼.

문제:
- HTML에는 "13:12\n\t\t\t\t\t\t2026-03-02 13:12:12" 형식으로 되어 있음
- 기존 parseDate 함수가 이 형식을 처리 못함

lib/crawlers/clien-crawler.ts의 parseDate 함수를 수정해서
정규식으로 "YYYY-MM-DD HH:MM:SS" 부분을 추출하도록 고쳐줘.
```

#### 5. Pull-to-Refresh 버그 수정 (2026-03-05)

```
Pull-to-Refresh가 스크롤 중간에서도 트리거되는 버그가 있어.

문제:
- 무한 스크롤 중에도 새로고침이 발생
- 의도치 않게 최상단으로 이동

components/pull-to-refresh.tsx를 수정해서:
1. touchMove 중에도 실시간으로 scrollTop 체크
2. scrollTop !== 0이면 상태 초기화
3. overscrollBehavior: 'contain' 추가

최상단에서만 작동하도록 고쳐줘.
```

#### 6. 광고 구현 (2026-03-15)

```
수익화를 위해 광고를 붙이고 싶어.

요구사항:
1. 웹: Google AdSense 자동 광고
   - app/layout.tsx에 스크립트 추가
   - 환경 변수로 클라이언트 ID 관리
2. 안드로이드: AdMob 하단 배너 광고
   - lib/admob.ts 파일 생성
   - 실제 광고 단위 ID 사용
3. 설정 가이드 문서 작성
   - ADSENSE-SETUP.md
   - ADMOB-SETUP.md

구현해줘.
```

---

## 결과와 배운 점

### 시행착오 모음

#### 1. **구 게시판 크롤링 사건** (2026-03-01)
**문제:** gasengi 크롤러가 2019년 아카이브 게시판(commu07)을 크롤링하고 있었음. 모든 게시글이 "84개월 전"으로 표시.

**해결:** URL을 commu08(잡담 게시판)으로 변경하고, 날짜 파싱 로직에 미래 날짜 검증 추가.

```typescript
// 미래 날짜면 작년으로 처리
if (date > now) {
  date.setFullYear(now.getFullYear() - 1);
}
```

#### 2. **메트릭 0건 사건** (2026-02-28)
**문제:** natepann 크롤러가 제목은 파싱하는데 조회수, 댓글, 좋아요가 모두 0. 필터링에서 전체 제거되어 데이터 0건.

**해결:** 실제 HTML 구조 확인 후 선택자 수정.
- 조회수: `.count` → "조회 " 텍스트 제거 필요
- 댓글: `.reple-num` (기존 `.comment` 잘못됨)
- 좋아요: `.rcm` (기존 `.like` 잘못됨)

**교훈:** 크롤러 구현 시 실제 HTML 검증 필수!

#### 3. **썸네일 핫링크 방지 문제** (2026-03-01)
**시도 1:** 17개 크롤러에 썸네일 수집 추가 (32% 수집률)

**문제:** 디시인사이드, 루리웹 등이 Referer 검증으로 이미지 로딩 차단. 브라우저 콘솔 에러 폭탄.

**시도 2:** Cloudflare Workers로 프록시 → 비용 발생

**최종 해결:** 썸네일 제거하고 **Google Favicon API**로 커뮤니티 아이콘만 표시.

```typescript
const faviconUrl = `https://www.google.com/s2/favicons?domain=${getSiteDomain(site.name)}&sz=32`;
```

**교훈:** 외부 이미지는 핫링크 방지 정책 확인 필수. 간단한 대안이 더 나을 수 있음.

#### 4. **사이트별 블록 현상** (2026-03-01)
**문제:** "전체" 탭에서 첫 140개 게시글이 모두 클리앙. 다른 커뮤니티를 보려면 7페이지 스크롤 필요.

**원인:** 사이트별 순차 크롤링 후 `fetchedAt` 기준 정렬 (모두 동일한 시간).

**시도 1:** `createdAt` 정렬 → 실패 (상대 시간 크롤러들이 동일 시간대 생성)

**최종 해결:** **라운드로빈 인터리빙**

```typescript
// 사이트별 그룹화 → 각 사이트에서 1개씩 순환하며 추출
for (let i = 0; i < maxLength; i++) {
  for (const site of siteNames) {
    if (groupedBySite[site][i]) {
      interleaved.push(groupedBySite[site][i]);
    }
  }
}
```

**효과:** 첫 30개 게시글에 17개 커뮤니티가 골고루 분포 (각 1~2건).

#### 5. **크롤링-배포 주기 불일치** (2026-03-01)
**문제:**
- 크롤링: 30분마다 실행
- 배포: 2시간마다 실행
- 사용자는 최대 2시간 전 데이터를 봄

**해결:**
```yaml
# crawl.yml - 크롤링 성공 시 즉시 배포 트리거
- name: Trigger deployment
  if: steps.commit.outputs.changed == 'true'
  run: |
    curl -X POST "${{ secrets.CLOUDFLARE_DEPLOY_HOOK }}"
```

**효과:** 크롤링 후 3분 내 배포 완료. 항상 최신 데이터 제공.

#### 6. **Pull-to-Refresh 폭주** (2026-03-05)
**문제:** 무한 스크롤 중에도 Pull-to-Refresh가 트리거되어 원하지 않는 새로고침 발생.

**원인:** `touchStart` 시점의 스크롤 위치만 확인. `touchMove` 중에는 체크 안 함.

**해결:** 실시간 스크롤 체크 추가

```typescript
const handleTouchMove = (e: TouchEvent) => {
  // 실시간으로 스크롤 위치 체크
  const currentScrollTop = window.scrollY;
  if (currentScrollTop !== 0) {
    // 최상단 아니면 상태 초기화
    setIsPulling(false);
    setPullDistance(0);
    return;
  }
  // ...
}
```

---

### 배운 점

#### 1. **AI 코딩의 핵심은 "명확한 요구사항"**
- ❌ "UI 개선해줘" → 모호함
- ✅ "Google Stitch처럼 색상 배지 추가, 메트릭 아이콘 표시" → 구체적

#### 2. **프롬프트는 짧을수록 좋다? NO!**
```
요구사항:
1. 기능 A를 X 방식으로
2. 에러 Y 발생 시 Z 처리
3. 기존 코드의 L 함수를 유지하면서
4. 예상되는 엣지 케이스: ...

구현해줘.
```
이렇게 상세할수록 정확한 결과를 얻음.

#### 3. **CLAUDE.md는 필수!**
- 프로젝트 컨텍스트를 파일로 관리
- 새 대화 세션에서도 전체 히스토리 참조 가능
- "최근 변경사항" 섹션에 모든 시행착오 기록

#### 4. **크롤러는 항상 실제 HTML 검증**
```bash
# Chrome DevTools로 실제 HTML 구조 확인
curl -s "https://example.com/board" | grep -A 5 "class=\"title\""
```
추측으로 선택자 작성하면 100% 실패함.

#### 5. **에러는 친구다**
- natepann 0건 사건 → 필터링 로직 개선
- 썸네일 문제 → 더 나은 대안 발견 (Favicon API)
- Pull-to-Refresh 버그 → 실시간 상태 체크 패턴 습득

#### 6. **정적 빌드의 마법**
- DB 없이 JSON 파일만으로 3,000개 게시글 서빙
- Cloudflare Pages 무료 호스팅 (월 500회 빌드)
- 로딩 속도 초고속 (CDN 캐싱)

---

### 나만의 꿀팁

#### 1. **크롤러 디버깅 패턴**
```typescript
// 개발 중에는 첫 1개만 파싱해서 콘솔 출력
const posts: Post[] = [];
$('tr.mytr').slice(0, 1).each((_, el) => {  // slice(0, 1) 추가
  const $el = $(el);
  console.log('HTML:', $el.html());  // 실제 HTML 확인
  console.log('Title:', $el.find('.title').text());
  // ...
});
```

#### 2. **타입 안전성 챙기기**
```typescript
// 메트릭 null 처리
const viewCount = (post.viewCount ?? 0);
const commentCount = (post.commentCount ?? 0);
```

#### 3. **GitHub Actions 비용 절감**
```yaml
# 데이터 변경 없으면 배포 안 함
- name: Check changes
  id: check
  run: |
    if git diff --quiet data/posts.json; then
      echo "changed=false" >> $GITHUB_OUTPUT
    else
      echo "changed=true" >> $GITHUB_OUTPUT
    fi
```

#### 4. **Cursor의 Composer 기능 활용**
- 여러 파일을 동시에 수정할 때 유용
- "14개 크롤러를 모두 5페이지 크롤링으로 확장" 같은 대량 작업에 최적

#### 5. **환경 변수로 유연성 확보**
```bash
# 개발 중에는 필터 완화
MIN_VIEW_COUNT=10 npm run crawl

# 프로덕션은 엄격하게
MIN_VIEW_COUNT=100 npm run crawl
```

---

### 앞으로의 계획

#### 단기 (1~2주)
- [ ] iOS 앱 출시 (Capacitor 활용)
- [ ] 실시간 알림 기능 (특정 키워드 모니터링)
- [ ] 게시글 북마크 기능 (LocalStorage)

#### 중기 (1~2개월)
- [ ] 커뮤니티별 카테고리 필터 (예: 루리웹 게임/유머 분리)
- [ ] 트렌딩 키워드 추출 (TF-IDF)
- [ ] 댓글 통계 차트 (Chart.js)

#### 장기 (3개월+)
- [ ] 커뮤니티 20개 → 30개 확장
- [ ] AI 요약 기능 (Claude API 활용)
- [ ] 사용자 맞춤 추천 알고리즘

---

### 도움이 필요한 부분

1. **IP 차단 대응**
   - 현재는 1~2초 딜레이로 해결 중
   - 더 안전한 방법이 있을까요? (Proxy Rotation?)

2. **크롤링 품질 개선**
   - 일부 사이트는 JavaScript 렌더링 필요 (Playwright?)
   - Cheerio만으로 한계가 있을까요?

3. **광고 수익화 최적화**
   - AdSense 자동 광고 vs 수동 배치
   - 사용자 경험을 해치지 않는 광고 위치는?

4. **iOS 앱 출시**
   - Capacitor로 만든 앱의 App Store 심사 팁?
   - 웹뷰 앱의 거부 사례가 있나요?

---

## 도움 받은 글

1. **Claude Code 공식 문서**
   - https://docs.anthropic.com/claude-code/overview
   - CLAUDE.md 작성 가이드라인

2. **Next.js Static Export**
   - https://nextjs.org/docs/app/building-your-application/deploying/static-exports
   - 정적 빌드 설정 방법

3. **Cheerio 공식 문서**
   - https://cheerio.js.org/
   - jQuery 스타일 HTML 파싱

4. **Cloudflare Pages 무료 호스팅**
   - https://pages.cloudflare.com/
   - GitHub Actions 연동 방법

5. **GPTers 커뮤니티**
   - 바이브코딩 사례 많이 참고했습니다!

---

## 마무리

**"2주 만에 웹 + 앱 출시"**는 AI 코딩 어시스턴트 없이는 불가능했을 겁니다.

하지만 AI가 모든 걸 해주는 건 아닙니다:
- 요구사항 정의 (내가)
- 버그 원인 추론 (내가)
- 최종 의사결정 (내가)

**AI는 타이핑 속도를 100배 빠르게 해주는 도구일 뿐, 사고는 여전히 내가 해야 합니다.**

그래도... 정말 재밌었습니다! 🚀

---

**GitHub:** [프로젝트 링크 추가]
**웹사이트:** [배포 URL 추가]
**앱:** [Play Store 링크 추가]
