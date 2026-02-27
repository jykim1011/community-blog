# Google Play 스토어 출시 가이드

## 준비사항

### 1. Google Play Developer 계정 등록
- https://play.google.com/console 접속
- $25 일회성 등록 비용 결제
- 개발자 프로필 작성

### 2. 개인정보처리방침 URL
- URL: `https://community-blog-eoc.pages.dev/privacy`
- Play Store 등록 시 필수 입력

## Release AAB 빌드

### Android Studio에서 빌드

1. Android Studio 실행
2. 프로젝트 열기: `D:\community-blog\android`
3. Build → Generate Signed Bundle / APK 선택
4. Android App Bundle 선택
5. 키스토어 정보 입력:
   - Key store path: `D:\community-blog\android\app\release-key.jks`
   - Key store password: `community2026!`
   - Key alias: `community-blog`
   - Key password: `community2026!`
6. Build Variant: `release` 선택
7. Build 클릭

**빌드 결과:**
`android/app/release/app-release.aab`

### 명령줄에서 빌드 (선택)

```bash
cd android
./gradlew bundleRelease

# Windows
gradlew.bat bundleRelease
```

## Play Store 등록

### 1. 앱 만들기
1. Play Console → 모든 앱 → 앱 만들기
2. 앱 이름: **통합 커뮤니티**
3. 기본 언어: 한국어
4. 앱 유형: 앱
5. 무료/유료: 무료

### 2. 앱 콘텐츠
- **개인정보처리방침**: https://community-blog-eoc.pages.dev/privacy
- **앱 액세스 권한**: 모든 기능 사용 가능 (특별한 액세스 불필요)
- **광고**: 광고 포함 (AdMob 연동 후)
- **콘텐츠 등급**: 설문지 작성 (뉴스/정보 카테고리)
- **타겟층**: 모든 연령
- **데이터 보안**: 개인정보 수집 안 함

### 3. 스토어 등록정보

**앱 이름:** 통합 커뮤니티

**간단한 설명 (80자):**
한국 주요 커뮤니티 인기글을 한눈에! 클리앙, 더쿠, 루리웹 등 17개 사이트 통합

**자세한 설명:**
```
통합 커뮤니티는 한국의 주요 커뮤니티 사이트 인기 게시글을 실시간으로 모아서 보여주는 서비스입니다.

✨ 주요 기능
• 17개 커뮤니티 사이트 통합 (클리앙, 더쿠, 루리웹, 디시인사이드, 인벤, 뽐뿌, MLB파크, 네이트판, 일베, 보배드림, 이토랜드, 웃긴대학, 82쿡, SLR클럽, 개드립, 히야갤, 오늘의유머)
• 15분마다 자동 업데이트되는 최신 인기글
• 사이트별 필터링
• 조회수, 댓글수, 추천수 표시
• 깔끔한 UI/UX

📱 편리한 사용
• 회원가입 불필요
• 깔끔하고 빠른 인터페이스
• 다크모드 지원
• 원본 게시글로 바로 이동

🔒 개인정보 보호
• 개인정보 수집 없음
• 로그인 불필요
• 안전한 외부 링크

모든 게시글은 원본 사이트에 저작권이 있으며, 본 앱은 링크 제공만 합니다.
```

**카테고리:** 뉴스 및 잡지

**태그:** 커뮤니티, 인기글, 뉴스, 한국, 클리앙, 더쿠

**이메일:** (본인 이메일 입력)

### 4. 그래픽 에셋

**필수:**
- 앱 아이콘: 512x512 (이미 생성됨)
- 스크린샷:
  - 휴대전화: 최소 2개 (1080x1920 ~ 7680x4320)
  - 태블릿 7인치: 선택사항
  - 태블릿 10인치: 선택사항

**스크린샷 제작:**
Galaxy S24 Ultra에서 앱 실행 후:
1. 메인 화면 (게시글 목록)
2. 사이트 필터 선택 화면
3. 특정 사이트 게시글 화면
4. 다크모드 화면

### 5. 프로덕션 트랙 출시

1. 프로덕션 → 새 버전 만들기
2. `app-release.aab` 업로드
3. 버전 이름: `1.0`
4. 버전 코드: `1`
5. 출시 노트 작성:
   ```
   첫 출시
   - 17개 커뮤니티 사이트 통합
   - 실시간 인기글 업데이트
   - 사이트별 필터링
   ```
6. 검토 후 출시

## 배포 관리

### 버전 업데이트

**현재 버전:** versionCode 2, versionName "1.0.1"

1. `android/app/build.gradle`에서 버전 수정:
   ```gradle
   versionCode 2  // 이전: 1
   versionName "1.0.1"  // 이전: "1.0"
   ```

2. 변경사항 커밋 후 새 AAB 빌드

3. Play Console에서 새 버전 업로드

**⚠️ 중요:** `/android` 디렉토리는 `.gitignore`에 포함되어 있어 git에서 추적되지 않습니다. 버전 변경 시 별도로 기록을 남겨야 합니다.

### 키 관리 (매우 중요!)

⚠️ **release-key.jks 파일 백업 필수!**

- 이 키를 분실하면 앱 업데이트 불가능
- 안전한 곳에 백업 (USB, 클라우드 등)
- 비밀번호 기록: `community2026!`

## 심사 및 출시

- 심사 기간: 보통 1~3일
- 승인 후 몇 시간 내 Play Store에 표시
- 업데이트는 더 빠름 (몇 시간~1일)

## 출시 후

1. Play Console에서 사용자 피드백 모니터링
2. 충돌 보고서 확인
3. 광고 연동 (AdMob)
4. ASO (앱 스토어 최적화) - 키워드, 스크린샷 개선

## 트러블슈팅

### "기존 사용자가 새롭게 추가된 App Bundle로 업그레이드하지 못하므로 이 버전은 출시할 수 없습니다"

**원인:** versionCode가 이전 출시 버전과 같거나 낮음

**해결 방법:**
1. `android/app/build.gradle`에서 versionCode를 증가
   ```gradle
   versionCode 2  // 매 출시마다 1씩 증가
   versionName "1.0.1"  // 사용자에게 표시되는 버전
   ```

2. 새로운 AAB 파일 빌드:
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew bundleRelease
   ```

3. 생성된 AAB 파일(`android/app/build/outputs/bundle/release/app-release.aab`)을 Play Console에 업로드

**참고:**
- versionCode는 내부 버전 번호로 매 출시마다 반드시 증가해야 함
- versionName은 사용자에게 표시되는 버전 (예: 1.0, 1.0.1, 1.1.0)
- 서명 키(`release-key.jks`)가 이전과 동일해야 업그레이드 가능
