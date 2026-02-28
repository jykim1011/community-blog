# 각 사이트 5페이지 크롤링 검토

## 개요

**요청:** 각 사이트별로 5페이지씩 크롤링

**현재 상황:**
- 각 크롤러: 1페이지만 크롤링 (20~50건)
- 총 17개 사이트
- 현재 게시글: 1,101건

**목표:**
- 각 사이트: 5페이지 크롤링 (100~250건)
- 예상 총 게시글: 3,000~4,500건

---

## 예상 결과

### 크롤링 데이터량

**페이지당 게시글 수 (사이트별):**

| 사이트 | 게시글/페이지 | 5페이지 예상 |
|--------|--------------|-------------|
| clien | 30건 | 150건 |
| ppomppu | 30건 | 150건 |
| dcinside | 50건 | 250건 |
| theqoo | 20건 | 100건 |
| ruliweb | 30건 | 150건 |
| slrclub | 30건 | 150건 |
| mlbpark | 30건 | 150건 |
| ilbe | 30건 | 150건 |
| inven | 8~16건 | 40~80건 |
| humoruniv | 10~20건 | 50~100건 |
| 기타 7개 | 20~30건 | 100~150건 |

**총 크롤링:**
- 17개 사이트 × 5페이지 × 평균 30건 = **2,550건**
- 범위: 2,000~3,500건

**필터링 적용 (50/3/5 기준):**
- 필터 통과율: 약 80~85%
- 최종 유지: **2,000~3,000건**
- MAX_POSTS = 3000이므로 대부분 유지

**사이트별 최종 분포 (예상):**
| 사이트 | 현재 | 5페이지 후 |
|--------|------|-----------|
| clien | 119건 | 120~130건 |
| ppomppu | 112건 | 120~130건 |
| dcinside | 99건 | 200~220건 |
| ilbe | 107건 | 120~130건 |
| slrclub | 95건 | 120~130건 |
| inven | 8건 | **60~80건** ⬆️ |
| humoruniv | 16건 | **80~100건** ⬆️ |

**주요 개선점:**
- ✅ inven: 8건 → 60~80건 (7.5~10배)
- ✅ humoruniv: 16건 → 80~100건 (5~6배)
- ✅ 하위 사이트 대폭 증가

---

## 파일 크기

**posts.json:**
- 현재: 485KB (1,101건)
- 예상: **1.3~1.5MB** (3,000건)

**압축 (gzip):**
- 예상: 300~400KB

**모바일 로딩:**
- 초기 로딩: 2~3초 (현재 0.5초)
- 여전히 허용 범위 ✅

---

## 크롤링 시간

**페이지당 시간:**
- 요청: 1초
- 딜레이: 1초 (IP 차단 방지)
- **합계: 2초/페이지**

**사이트별:**
- 5 페이지 × 2초 = **10초**

**전체:**
- 17개 사이트 × 10초 = **170초 (약 3분)**
- 사이트 간 딜레이 없음 (병렬 처리)
- **총 크롤링 시간: 약 3~5분**

**GitHub Actions:**
- 타임아웃: 360분 (6시간)
- **3분은 충분히 허용 범위** ✅

---

## IP 차단 위험

### 요청 횟수 변화

**현재:**
- 각 사이트: 1 요청
- 17개 사이트: 17 요청

**5페이지 후:**
- 각 사이트: 5 요청
- 17개 사이트: 85 요청
- **증가율: 5배**

### 위험도 평가

**전체 위험도: 낮음 (15%)**

**저위험 사이트 (85%):**
- clien, dcinside, theqoo, ruliweb, inven, mlbpark, ilbe, bobaedream, natepann, cook82, etoland, todayhumor, gasengi, hygall, humoruniv
- **대응:** 1초 딜레이면 안전
- **이유:** 초당 1 요청은 일반적으로 허용됨

**중위험 사이트 (15%):**
- ppomppu, slrclub
- **대응:** 2초 딜레이 권장
- **이유:** 일부 사용자가 레이트리밋 경험

**고위험 사이트 (0%):**
- 없음

**결론:**
- ✅ 5페이지는 **IP 차단 위험 매우 낮음**
- ✅ 1~2초 딜레이로 충분히 안전
- ✅ GitHub Actions IP는 매 실행마다 변경됨

---

## 구현 방법

### 1. BaseCrawler에 다중 페이지 지원 추가

**옵션 A: 각 크롤러에서 직접 구현**
```typescript
// 예: clien-crawler.ts
async crawl(): Promise<Post[]> {
  const allPosts: Post[] = [];
  const PAGES_TO_CRAWL = 5;

  for (let page = 1; page <= PAGES_TO_CRAWL; page++) {
    const url = this.getPageUrl(page);
    const posts = await this.crawlPage(url);
    allPosts.push(...posts);

    if (page < PAGES_TO_CRAWL) {
      await this.delay(1000);  // 1초 딜레이
    }
  }

  return allPosts;
}

private getPageUrl(page: number): string {
  // clien: ?po=0, ?po=20, ?po=40
  const offset = (page - 1) * 20;
  return `${this.boardUrl}?po=${offset}`;
}
```

**옵션 B: BaseCrawler에 헬퍼 메서드 추가**
```typescript
// base-crawler.ts
export abstract class BaseCrawler implements ICrawler {
  protected async crawlMultiplePages(
    getPageUrl: (page: number) => string,
    crawlPage: (url: string) => Promise<Post[]>,
    maxPages: number = 5,
    delayMs: number = 1000
  ): Promise<Post[]> {
    const allPosts: Post[] = [];

    for (let page = 1; page <= maxPages; page++) {
      const url = getPageUrl(page);
      const posts = await crawlPage(url);
      allPosts.push(...posts);

      if (page < maxPages) {
        await this.delay(delayMs);
      }
    }

    return allPosts;
  }
}
```

**권장: 옵션 A** (각 크롤러마다 페이지네이션 패턴이 다르므로)

### 2. 사이트별 페이지네이션 URL 패턴

| 사이트 | URL 패턴 | 예시 |
|--------|---------|------|
| clien | `?po={offset}` | ?po=0, ?po=20, ?po=40 |
| ppomppu | `&page={page}` | &page=1, &page=2, &page=3 |
| dcinside | `&page={page}` | &page=1, &page=2, &page=3 |
| theqoo | `&page={page}` | &page=1, &page=2, &page=3 |
| ruliweb | `&page={page}` | &page=1, &page=2, &page=3 |
| slrclub | `?page={page}` | ?page=1, ?page=2, ?page=3 |
| mlbpark | `?p={page}` | ?p=1, ?p=2, ?p=3 |
| ilbe | `&page={page}` | &page=1, &page=2, &page=3 |
| inven | `&page={page}` | &page=1, &page=2, &page=3 |
| bobaedream | `&page={page}` | &page=1, &page=2, &page=3 |
| natepann | `&page={page}` | &page=1, &page=2, &page=3 |
| cook82 | `&page={page}` | &page=1, &page=2, &page=3 |
| etoland | `&page={page}` | &page=1, &page=2, &page=3 |
| humoruniv | `&page={page}` | &page=1, &page=2, &page=3 |
| gasengi | `&page={page}` | &page=1, &page=2, &page=3 |
| hygall | `&page={page}` | &page=1, &page=2, &page=3 |
| todayhumor | `&page={page}` | &page=1, &page=2, &page=3 |

**참고:** 실제 URL은 각 크롤러 구현 시 확인 필요

### 3. 수정이 필요한 크롤러

**17개 크롤러 모두 수정 필요:**
1. clien-crawler.ts
2. ppomppu-crawler.ts
3. dcinside-crawler.ts
4. theqoo-crawler.ts
5. ruliweb-crawler.ts
6. slrclub-crawler.ts
7. mlbpark-crawler.ts
8. ilbe-crawler.ts
9. inven-crawler.ts
10. bobaedream-crawler.ts
11. natepann-crawler.ts
12. cook82-crawler.ts
13. etoland-crawler.ts
14. humoruniv-crawler.ts
15. gasengi-crawler.ts
16. hygall-crawler.ts
17. todayhumor-crawler.ts

**비활성 크롤러 (수정 불필요):**
- fmkorea-crawler.ts (430 에러)
- arca-crawler.ts (403 에러)

---

## 구현 난이도

### 작업 시간 예상

**크롤러별 수정:**
- 기존 `crawl()` 메서드를 `crawlPage(url)` 메서드로 분리
- `crawl()` 메서드에 다중 페이지 루프 추가
- URL 패턴 확인 및 `getPageUrl()` 메서드 추가
- **평균 시간: 15~20분/크롤러**

**전체 작업:**
- 17개 크롤러 × 20분 = **340분 (약 5.5시간)**
- 테스트 및 버그 수정: 1~2시간
- **총 작업 시간: 7~8시간**

### 복잡도

**낮음 (쉬움):**
- 대부분 크롤러가 비슷한 구조
- 단순 반복 작업
- 페이지네이션 패턴 파악만 하면 됨

**주의사항:**
- 각 사이트마다 URL 패턴이 다름
- 실제 URL 테스트 필요
- ppomppu, slrclub은 2초 딜레이 필요

---

## 에러 핸들링

### 추가해야 할 에러 처리

```typescript
async crawl(): Promise<Post[]> {
  const allPosts: Post[] = [];
  const PAGES_TO_CRAWL = 5;

  for (let page = 1; page <= PAGES_TO_CRAWL; page++) {
    try {
      const url = this.getPageUrl(page);
      const posts = await this.crawlPage(url);

      // 빈 페이지 감지 (더 이상 페이지 없음)
      if (posts.length === 0) {
        console.log(`[${this.siteName}] No more posts at page ${page}, stopping`);
        break;
      }

      allPosts.push(...posts);

      // 딜레이
      if (page < PAGES_TO_CRAWL) {
        await this.delay(1000);
      }
    } catch (error) {
      // 429 Too Many Requests
      if (error.response?.status === 429) {
        console.warn(`[${this.siteName}] Rate limited at page ${page}, waiting 10 seconds...`);
        await this.delay(10000);
        page--;  // 재시도
        continue;
      }

      // 404 Not Found (페이지 없음)
      if (error.response?.status === 404) {
        console.log(`[${this.siteName}] Page ${page} not found, stopping`);
        break;
      }

      // 기타 에러
      console.error(`[${this.siteName}] Error at page ${page}:`, error.message);
      break;  // 에러 시 중단
    }
  }

  return allPosts;
}
```

---

## 장점

✅ **데이터 대폭 증가**
- 1,101건 → 3,000건 (2.7배)
- 하위 사이트(inven, humoruniv) 대폭 개선

✅ **균형잡힌 분포**
- 대부분 사이트: 120~220건
- 극단적 불균형 해소

✅ **IP 차단 위험 낮음**
- 5페이지는 안전한 범위
- 1~2초 딜레이로 충분

✅ **크롤링 시간 허용 가능**
- 3~5분 (현재 5분과 비슷)
- GitHub Actions 타임아웃 내

✅ **파일 크기 허용 가능**
- 1.5MB (모바일 2~3초 로딩)

✅ **무한 스크롤 대폭 개선**
- 55회 → 150회 (2.7배)

---

## 단점

⚠️ **구현 시간 소요**
- 7~8시간 작업
- 17개 크롤러 모두 수정

⚠️ **각 사이트 URL 패턴 확인 필요**
- 실제 테스트 필요
- 일부 사이트는 페이지네이션 구조가 다를 수 있음

⚠️ **크롤링 시간 증가**
- 5분 → 3~5분 (큰 차이 없음)

⚠️ **사이트 부하 증가**
- 17 요청 → 85 요청 (5배)
- 하지만 여전히 안전한 수준

---

## 비교: 5페이지 vs 1000건

| 항목 | 5페이지 | 1000건 (시나리오 D) |
|------|---------|---------------------|
| **총 게시글** | 3,000건 | 15,000건 |
| **파일 크기** | 1.5MB | 6~7MB |
| **구현 시간** | 7~8시간 | 10~12시간 |
| **크롤링 시간** | 3~5분 | 35~40분 |
| **IP 차단 위험** | 낮음 (15%) | 중간 (40%) |
| **페이지 수** | 5 페이지 | 20~50 페이지 |
| **사이트 부하** | 낮음 | 중간 |
| **권장 여부** | ✅ **강력 권장** | ⚠️ 조건부 |

**결론: 5페이지가 훨씬 현실적이고 안전함**

---

## 비교: 시나리오 A vs C vs 5페이지

| 항목 | A (MAX 3000) | C (균형) | **5페이지** |
|------|--------------|----------|-------------|
| **총 게시글** | 1,101건 | 1,300건 | **3,000건** |
| **증가율** | 10% | 30% | **172%** |
| **구현 시간** | 5분 | 30분 | **7~8시간** |
| **inven** | 30~50건 | 100~150건 | **60~80건** |
| **humoruniv** | 30~50건 | 100~150건 | **80~100건** |
| **IP 차단** | 매우 낮음 | 매우 낮음 | **낮음** |
| **권장** | ✔️ | ✔️ | ✅ **가장 효과적** |

---

## 최종 권장안

### ✅ 5페이지 크롤링 구현 권장

**이유:**
1. **효과 뚜렷**: 1,101건 → 3,000건 (2.7배)
2. **안전**: IP 차단 위험 낮음 (15%)
3. **현실적**: 7~8시간 작업 (시나리오 D의 10~12시간보다 짧음)
4. **균형**: 모든 사이트 120~220건 (inven 제외)
5. **성능**: 파일 크기 1.5MB, 로딩 2~3초 (허용 범위)

**구현 순서:**
1. BaseCrawler에 헬퍼 메서드 추가 (선택)
2. clien-crawler 먼저 수정 및 테스트
3. ppomppu, dcinside 등 주요 사이트 수정
4. 나머지 14개 사이트 일괄 수정
5. 전체 테스트
6. 커밋 및 배포

**예상 일정:**
- Day 1: 5시간 (10개 크롤러)
- Day 2: 3시간 (7개 크롤러 + 테스트)
- **총 2일 작업**

---

## 대안: 단계적 구현

**만약 7~8시간이 부담스럽다면:**

### Phase 1: 하위 사이트만 5페이지 (1~2시간)
- inven, humoruniv만 수정
- 예상: 1,101 → 1,300건 (200건 증가)

### Phase 2: 주요 사이트 추가 (2~3시간)
- clien, ppomppu, dcinside, slrclub 추가
- 예상: 1,300 → 2,000건 (700건 증가)

### Phase 3: 전체 완성 (7~8시간)
- 나머지 사이트 모두
- 예상: 2,000 → 3,000건 (1,000건 증가)

**장점:**
- 점진적 개선
- 중간 결과 확인 가능
- 문제 발생 시 조기 발견

---

## 결론

### ✅ 5페이지 크롤링을 강력히 권장합니다

**근거:**
- 시나리오 A (MAX 3000): **효과 미미** (10% 증가)
- 시나리오 C (균형 조정): **근본 해결 안 됨**
- **5페이지 크롤링**: **가장 현실적이고 효과적** (2.7배 증가)
- 시나리오 D (1000건): **과도함** (IP 차단 위험, 크롤링 시간)

**투자 대비 효과:**
- 7~8시간 투자 → 1,900건 증가
- 시간당 약 240건 증가
- **매우 효율적**

**다음 단계:**
1. 사용자 승인
2. 구현 시작 (clien-crawler부터)
3. 단계적 테스트
4. 전체 배포
