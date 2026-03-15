# Google AdSense 웹 광고 설정 가이드

## 📱 현재 상태

- ✅ AdSense 컴포넌트 구현 완료 (`components/adsense-banner.tsx`)
- ✅ Layout에 AdSense 스크립트 추가 (`app/layout.tsx`)
- ✅ 인피드 광고 배치 완료 (게시글 6개마다)
- ⚠️ **AdSense 계정 승인 필요** (실제 광고 표시 전)

## 🚀 AdSense 계정 설정

### 1. AdSense 계정 생성

1. https://www.google.com/adsense 접속
2. Google 계정으로 로그인
3. "시작하기" 클릭
4. **웹사이트 URL** 입력: `https://community-blog-eoc.pages.dev`
5. 국가/지역: 대한민국
6. 서비스 약관 동의

### 2. 사이트 승인 절차

#### 2-1. AdSense 코드 삽입 (이미 완료 ✅)

AdSense에서 제공하는 코드는 이미 `app/layout.tsx`에 추가되어 있습니다:

```typescript
<Script
  async
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

#### 2-2. 환경 변수 설정

`.env` 파일 생성 (또는 Cloudflare Pages 환경 변수에 추가):

```bash
# AdSense 계정에서 받은 클라이언트 ID (예: ca-pub-1234567890123456)
NEXT_PUBLIC_ADSENSE_CLIENT_ID="ca-pub-YOUR-CLIENT-ID"
```

#### 2-3. 빌드 및 배포

```bash
# 웹 빌드
npm run build

# Cloudflare Pages에 배포 (자동 배포 또는 수동 업로드)
```

#### 2-4. AdSense에서 사이트 확인

1. AdSense 콘솔 → **사이트** → **사이트 추가**
2. "코드가 삽입되었습니다" 체크
3. **승인 요청**
4. **승인 대기** (보통 1~7일 소요)
   - Google이 사이트 품질, 콘텐츠, 트래픽 검토
   - 이메일로 승인 결과 통보

### 3. 광고 단위 생성 (승인 후)

승인 완료 후 광고 단위를 생성합니다.

#### 3-1. 인피드 광고 (게시글 사이)

1. AdSense 콘솔 → **광고** → **광고 단위별** → **디스플레이 광고**
2. **광고 단위 이름**: Community InFeed
3. **광고 유형**: 반응형
4. **광고 만들기** 클릭
5. **광고 단위 코드** 확인:
   ```html
   data-ad-slot="1234567890"
   ```
   → 이 숫자를 복사

#### 3-2. 환경 변수 추가

```bash
# .env 파일에 추가
NEXT_PUBLIC_ADSENSE_INFEED_SLOT="1234567890"
```

#### 3-3. 재배포

```bash
npm run build
# Cloudflare Pages에 재배포
```

## 📍 광고 배치 위치

### 현재 구현

- ✅ **인피드 광고**: 게시글 6개마다 삽입
  - 위치: `components/post-list.tsx`
  - 조건: `(index + 1) % 6 === 0`
  - PC/모바일 모두 표시

### 추가 가능한 광고 배치 (선택사항)

#### 1. 상단 배너 (헤더 아래)

`app/page.tsx` 수정:

```typescript
import { AdSenseResponsive } from '@/components/adsense-banner';

export default function Home() {
  return (
    <main>
      {/* 상단 배너 광고 */}
      <AdSenseResponsive
        adSlot={process.env.NEXT_PUBLIC_ADSENSE_TOP_BANNER || ''}
        className="mb-4"
      />

      <PostList posts={posts} sites={sites} />
    </main>
  );
}
```

환경 변수 추가:
```bash
NEXT_PUBLIC_ADSENSE_TOP_BANNER="0987654321"
```

#### 2. 사이드바 광고 (PC 전용)

PC 화면에서 우측 사이드바에 광고 표시 (별도 레이아웃 작업 필요)

#### 3. 하단 고정 배너 (모바일)

모바일 하단에 고정 배너 광고 (AdMob과 유사)

## 🧪 테스트

### 승인 전 (플레이스홀더 표시)

환경 변수가 없으면 회색 박스로 "광고 영역" 플레이스홀더 표시:

```
┌─────────────────────────┐
│ 광고 영역               │
│ (AdSense 승인 후 표시됨)│
└─────────────────────────┘
```

### 승인 후 (실제 광고 표시)

1. 환경 변수 설정 후 재배포
2. 실제 사이트에서 광고 표시 확인
3. AdSense 콘솔에서 노출수 확인

⚠️ **주의**: 자신의 광고를 클릭하지 마세요 (계정 정지 위험)

## 💰 수익 설정

### 결제 정보 등록

1. AdSense 콘솔 → **결제** → **결제 정보**
2. 수취인 정보 입력:
   - 이름/주소
   - 납세자 정보 (사업자/개인)
3. 결제 방법:
   - 은행 계좌 (ACH 이체)
   - 최소 지급액: ₩100,000 ($100)

### 예상 수익

- 반응형 디스플레이 광고 CPM: ₩300-1,500 (한국 기준)
- 1,000 노출당 평균 수익
- 실제 수익은 클릭률(CTR), 광고주 입찰가에 따라 달라짐

## 📝 AdSense 정책 준수

### 필수 페이지

1. **개인정보처리방침** ✅ (이미 구현됨: `/privacy`)
   - AdSense 사용 명시
   - 쿠키 사용 설명
   - 데이터 수집 안내

2. **서비스 약관** (권장)

### 금지 콘텐츠

AdSense 정책 위반 콘텐츠 게재 금지:
- 성인 콘텐츠
- 저작권 침해
- 위험한 콘텐츠
- 증오성 콘텐츠

현재 프로젝트는 커뮤니티 게시글 링크만 제공하므로 문제 없음.

## 🔄 환경별 설정

### 개발 환경 (localhost)

AdSense는 localhost에서 작동하지 않습니다. 플레이스홀더만 표시됩니다.

### 프로덕션 환경 (Cloudflare Pages)

**Cloudflare Pages 환경 변수 설정:**

1. Cloudflare Pages 대시보드
2. 프로젝트 선택 → **Settings** → **Environment variables**
3. **Production** 탭에서 추가:
   ```
   NEXT_PUBLIC_ADSENSE_CLIENT_ID = ca-pub-xxxxxxxxxx
   NEXT_PUBLIC_ADSENSE_INFEED_SLOT = 1234567890
   ```
4. 재배포 (자동 배포 또는 수동 트리거)

## 📊 수익 모니터링

- AdSense 콘솔에서 실시간 통계 확인
- 주요 지표:
  - 페이지 조회수 (Page views)
  - 노출수 (Impressions)
  - 클릭수 (Clicks)
  - 페이지 CTR (Click-Through Rate)
  - 페이지 RPM (Revenue Per Mille)
  - 예상 수익

## 🎯 최적화 팁

### 1. 광고 밀도 조절

현재: 6개 게시글마다 광고 1개 (16.7%)

- **트래픽 증가 목표**: 광고 줄이기 (8개마다 → 12.5%)
- **수익 증가 목표**: 광고 늘리기 (4개마다 → 25%)

`components/post-list.tsx` 수정:
```typescript
// 6개마다 → 4개마다
{(index + 1) % 4 === 0 && ...}
```

### 2. 광고 위치 실험

- 상단 광고: 높은 노출수, 낮은 CTR
- 인피드 광고: 자연스러운 통합, 높은 CTR
- 사이드바 광고: PC 전용, 안정적 수익

### 3. 반응형 최적화

AdSense는 자동으로 디바이스에 맞게 광고 크기 조정:
- 모바일: 320x50, 300x250
- 태블릿: 728x90, 300x600
- PC: 728x90, 970x90, 300x600

## ⚠️ 주의사항

1. **자가 클릭 금지**: 본인 광고 클릭 시 계정 정지
2. **정책 준수**: AdSense 정책 위반 시 계정 정지
3. **최소 수익**: ₩100,000 이상부터 지급
4. **승인 시간**: 보통 1~7일 소요 (사이트 품질에 따라 다름)
5. **트래픽 필요**: 승인받으려면 일정 트래픽 필요 (명확한 기준 없음)

## 🎯 다음 단계

### AdSense 승인 전

- [x] AdSense 코드 구현
- [ ] AdSense 계정 생성
- [ ] 사이트 등록
- [ ] 클라이언트 ID 발급
- [ ] 환경 변수 설정 및 배포
- [ ] 승인 요청

### AdSense 승인 후

- [ ] 인피드 광고 단위 생성
- [ ] 광고 슬롯 ID 환경 변수 추가
- [ ] 재배포 및 광고 표시 확인
- [ ] 결제 정보 등록
- [ ] 수익 모니터링 시작

## 🔗 참고 자료

- [AdSense 시작 가이드](https://support.google.com/adsense/answer/10162)
- [AdSense 프로그램 정책](https://support.google.com/adsense/answer/48182)
- [광고 배치 가이드](https://support.google.com/adsense/answer/1354736)
- [AdSense와 AdMob 차이](https://support.google.com/adsense/answer/6052739)

## 💡 FAQ

**Q: AdSense와 AdMob을 동시에 사용할 수 있나요?**
A: 네, 가능합니다. AdSense(웹)와 AdMob(앱)은 별도 플랫폼이며, 동일한 Google 계정으로 관리할 수 있습니다.

**Q: 승인이 거부되면 어떻게 하나요?**
A: 거부 사유를 확인하고 개선 후 재신청 가능합니다. 보통 콘텐츠 품질, 트래픽 부족이 원인입니다.

**Q: localhost에서 테스트할 수 있나요?**
A: AdSense는 실제 도메인에서만 작동합니다. localhost에서는 플레이스홀더만 표시됩니다.

**Q: 광고가 표시되지 않아요.**
A: 1) AdSense 승인 확인 2) 환경 변수 설정 확인 3) 광고 단위 활성 상태 확인 4) 브라우저 광고 차단 해제
