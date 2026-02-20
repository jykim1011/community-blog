import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.communityblog.app',
  appName: '통합 커뮤니티',
  webDir: 'out',
  // 개발 중: 로컬 빌드 사용 (빠른 테스트)
  // 프로덕션: 아래 주석 해제하여 Cloudflare Pages 사용
  // server: {
  //   url: 'https://community-blog-eoc.pages.dev',
  //   cleartext: true
  // }
};

export default config;
