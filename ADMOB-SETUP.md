# Google AdMob 설정 가이드

## 📱 현재 상태

- ✅ AdMob 플러그인 설치 완료 (`@capacitor-community/admob`)
- ✅ 배너 광고 컴포넌트 구현 (`components/admob-banner.tsx`)
- ✅ Android Manifest 설정 완료
- ⚠️ **테스트 광고 ID 사용 중** (실제 AdMob 계정 필요)

## 🚀 AdMob 계정 설정

### 1. AdMob 계정 생성

1. https://admob.google.com 접속
2. Google 계정으로 로그인
3. "시작하기" 클릭
4. 국가 선택: 대한민국
5. 서비스 약관 동의

### 2. 앱 등록

1. AdMob 콘솔 → **앱** → **앱 추가**
2. **플랫폼**: Android
3. **앱이 이미 게시되어 있나요?**:
   - Play Store에 출시 전: "아니요"
   - Play Store에 출시 후: "예" (패키지명 입력)
4. **앱 이름**: 통합 커뮤니티
5. **앱 추가** 클릭

### 3. 앱 ID 확인

등록 완료 후 앱 ID가 생성됩니다:
```
형식: ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
예시: ca-app-pub-1234567890123456~1234567890
```

### 4. 광고 단위 생성

#### 배너 광고 (하단)

1. AdMob 콘솔 → **앱** → 통합 커뮤니티 선택
2. **광고 단위** 탭 → **광고 단위 추가**
3. **배너** 선택
4. 설정:
   - **광고 단위 이름**: Bottom Banner
   - **광고 크기**: 적응형 배너 (권장)
5. **광고 단위 생성** 클릭
6. **광고 단위 ID** 복사:
   ```
   형식: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
   ```

#### 배너 광고 (상단) - 선택사항

같은 방법으로 상단 배너 광고 단위 생성:
- **광고 단위 이름**: Top Banner

#### 인터스티셜 광고 - 선택사항

1. **광고 단위 추가** → **전면 광고** 선택
2. **광고 단위 이름**: Interstitial
3. **광고 단위 생성** 클릭

## 🔧 코드 업데이트

### 1. AndroidManifest.xml 업데이트

`android/app/src/main/AndroidManifest.xml` 파일에서:

```xml
<!-- 현재 (테스트 ID) -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713"/>

<!-- 실제 AdMob 앱 ID로 교체 -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-YOUR-APP-ID"/>
```

### 2. lib/admob.ts 업데이트

광고 단위 ID를 실제 ID로 교체:

```typescript
// 현재 (테스트 ID)
const ADMOB_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

export const AD_UNITS = {
  BANNER_BOTTOM: 'ca-app-pub-3940256099942544/6300978111',
  BANNER_TOP: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
};

// 실제 ID로 교체
const ADMOB_APP_ID = 'ca-app-pub-YOUR-APP-ID~YOUR-APP-ID-SUFFIX';

export const AD_UNITS = {
  BANNER_BOTTOM: 'ca-app-pub-YOUR-APP-ID/YOUR-BANNER-ID',
  BANNER_TOP: 'ca-app-pub-YOUR-APP-ID/YOUR-TOP-BANNER-ID',
  INTERSTITIAL: 'ca-app-pub-YOUR-APP-ID/YOUR-INTERSTITIAL-ID',
};
```

### 3. 테스트 모드 비활성화

`lib/admob.ts`에서:

```typescript
// 개발 중
await AdMob.initialize({
  requestTrackingAuthorization: true,
  testingDevices: ['YOUR_DEVICE_ID'],
  initializeForTesting: true, // 테스트 모드
});

// 프로덕션
await AdMob.initialize({
  requestTrackingAuthorization: true,
  initializeForTesting: false, // 실제 광고
});
```

## 📍 광고 배치 위치

### 현재 구현
- ✅ **하단 배너**: 메인 페이지 하단 (푸터 위)
- ⏳ **상단 배너**: 미구현 (선택사항)
- ⏳ **전면 광고**: 미구현 (선택사항)

### 권장 배치

1. **배너 광고 (하단)**
   - 위치: 푸터 바로 위
   - 현재 구현됨
   - UX 영향 최소

2. **전면 광고** (선택)
   - 타이밍: 페이지 전환 시 (5-10페이지마다)
   - 구현 방법: `components/post-list.tsx`에서 페이지 변경 감지

## 🧪 테스트

### 테스트 광고 ID 사용 중

현재 Google 제공 테스트 ID를 사용하여 개발 중:
- 앱 ID: `ca-app-pub-3940256099942544~3347511713`
- 배너: `ca-app-pub-3940256099942544/6300978111`
- 전면: `ca-app-pub-3940256099942544/1033173712`

### 실제 광고 테스트

1. AdMob 계정 생성 및 광고 단위 ID 발급
2. 코드에 실제 ID 적용
3. AAB 빌드
4. 실기기에서 테스트

⚠️ **주의**: 자신의 광고를 클릭하지 마세요 (계정 정지 위험)

## 💰 수익 설정

### 결제 정보 등록

1. AdMob 콘솔 → **결제** → **결제 정보**
2. 수취인 정보 입력:
   - 이름/주소
   - 납세자 정보 (사업자/개인)
3. 결제 방법:
   - 은행 계좌 (ACH 이체)
   - 최소 지급액: ₩100,000 ($100)

### 예상 수익

- 배너 광고 CPM: ₩500-2,000 (한국 기준)
- 1,000 노출당 평균 수익
- 실제 수익은 광고 클릭률(CTR)에 따라 달라짐

## 📝 Play Store 정책

### 광고 관련 필수 설정

1. **Play Console → 앱 콘텐츠 → 광고**
   - "광고 포함" 선택

2. **개인정보처리방침 업데이트**
   - AdMob 광고 사용 명시
   - 이미 `/privacy` 페이지에 포함됨

3. **GDPR 준수** (EU 사용자)
   - AdMob이 자동 처리
   - 동의 양식 표시 (EU 지역만)

## 🔄 업데이트 후 배포

1. 코드 업데이트 (실제 광고 ID)
2. `npm run build`
3. `npx cap sync android`
4. Android Studio에서 Release AAB 빌드
5. Play Console에 업로드

## 📊 수익 모니터링

- AdMob 콘솔에서 실시간 통계 확인
- 주요 지표:
  - 노출수 (Impressions)
  - 클릭수 (Clicks)
  - CTR (Click-Through Rate)
  - eCPM (효율적 CPM)
  - 예상 수익

## ⚠️ 주의사항

1. **테스트 ID 제거**: 프로덕션 배포 전 반드시 실제 ID로 교체
2. **자가 클릭 금지**: 본인 광고 클릭 시 계정 정지
3. **정책 준수**: AdMob 정책 위반 시 계정 정지
4. **최소 수익**: ₩100,000 이상부터 지급

## 🎯 다음 단계

- [ ] AdMob 계정 생성
- [ ] 앱 및 광고 단위 등록
- [ ] 실제 광고 ID로 코드 업데이트
- [ ] AAB 재빌드 및 Play Store 업로드
- [ ] 광고 수익 모니터링 시작
