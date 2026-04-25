import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.communityblog.app',
  appName: '통합 커뮤니티',
  webDir: 'out',
  // Cloudflare Pages에서 최신 데이터 자동 갱신 (30분마다)
  server: {
    url: 'https://community-blog-eoc.pages.dev',
    cleartext: true
  }
};

export default config;
