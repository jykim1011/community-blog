import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.communityblog.app',
  appName: '커뮤니티 통합 블로그',
  webDir: 'out',
  server: {
    url: 'https://community-blog-eoc.pages.dev',
    cleartext: true
  }
};

export default config;
