import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.communityblog.app',
  appName: '통합 커뮤니티',
  webDir: 'out',
  // 프로덕션: Cloudflare Pages에서 최신 데이터 자동 갱신
  // 개발 중 로컬 테스트: 아래 server 섹션 주석 처리
  server: {
    url: 'https://community-blog-eoc.pages.dev',
    cleartext: true
  },
  plugins: {
    Browser: {
      presentationStyle: 'popover'
    }
  }
};

export default config;
