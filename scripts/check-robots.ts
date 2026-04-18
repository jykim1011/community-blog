import { robotsChecker } from '../lib/utils/robots-checker';
import { siteConfigs } from '../lib/constants';

async function checkAllRobots() {
  console.log('🤖 Checking robots.txt for all sites...\n');

  for (const [siteName, config] of Object.entries(siteConfigs)) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 ${config.displayName} (${siteName})`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    try {
      // 사이트 URL 구성
      const baseUrl = config.url.match(/https?:\/\/[^\/]+/)?.[0];
      if (!baseUrl) {
        console.log('❌ Invalid URL');
        continue;
      }

      // robots.txt 가져오기
      const rules = await robotsChecker.getRobotsTxt(baseUrl);

      if (rules.length === 0) {
        console.log('✅ No robots.txt or no restrictions');
        continue;
      }

      // Crawl-Delay 확인
      const crawlDelay = await robotsChecker.getCrawlDelay(baseUrl, 'CommunityBlogBot/1.0');
      if (crawlDelay) {
        console.log(`⏱️  Crawl-Delay: ${crawlDelay}s`);
      }

      // 규칙 출력
      for (const rule of rules) {
        console.log(`\nUser-Agent: ${rule.userAgent}`);

        if (rule.disallow.length > 0) {
          console.log('❌ Disallow:');
          rule.disallow.forEach((path) => {
            console.log(`   - ${path || '(empty)'}`);
          });
        }

        if (rule.allow.length > 0) {
          console.log('✅ Allow:');
          rule.allow.forEach((path) => {
            console.log(`   - ${path}`);
          });
        }

        if (rule.crawlDelay) {
          console.log(`⏱️  Crawl-Delay: ${rule.crawlDelay}s`);
        }
      }

      // 현재 크롤링하는 URL이 허용되는지 확인
      const canCrawl = await robotsChecker.canCrawl(config.url, 'CommunityBlogBot/1.0');
      console.log(`\n현재 크롤링 URL: ${config.url}`);
      console.log(`크롤링 가능 여부: ${canCrawl ? '✅ 허용' : '❌ 금지'}`);

    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
    }
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let allowedCount = 0;
  let blockedCount = 0;
  let errorCount = 0;

  for (const [siteName, config] of Object.entries(siteConfigs)) {
    try {
      const canCrawl = await robotsChecker.canCrawl(config.url, 'CommunityBlogBot/1.0');
      if (canCrawl) {
        allowedCount++;
        console.log(`✅ ${config.displayName}`);
      } else {
        blockedCount++;
        console.log(`❌ ${config.displayName} - robots.txt 차단`);
      }
    } catch (error) {
      errorCount++;
      console.log(`⚠️  ${config.displayName} - 확인 실패`);
    }
  }

  console.log(`\n총 ${Object.keys(siteConfigs).length}개 사이트`);
  console.log(`✅ 허용: ${allowedCount}개`);
  console.log(`❌ 차단: ${blockedCount}개`);
  console.log(`⚠️  오류: ${errorCount}개`);
}

checkAllRobots().catch(console.error);
