import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';

const sites = [
  { name: 'quasarzone', url: 'https://quasarzone.com/bbs/qb_saleinfo', encoding: 'utf-8' },
  { name: 'dealbada', url: 'http://www.dealbada.com/bbs/board.php?bo_table=deal_domestic', encoding: 'euc-kr' },
  { name: 'dvdprime', url: 'https://dvdprime.com/g2/bbs/board.php?bo_table=comm', encoding: 'utf-8' },
  { name: 'coolenjoy', url: 'https://coolenjoy.net/bbs/freeboard2', encoding: 'utf-8' },
  { name: 'extmovie', url: 'https://extmovie.com/movietalk', encoding: 'utf-8' },
];

async function debugSite(site: { name: string; url: string; encoding: string }) {
  console.log(`\n========== ${site.name} (${site.url}) ==========`);

  try {
    const response = await axios.get(site.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      responseType: site.encoding === 'euc-kr' ? 'arraybuffer' : 'text',
      timeout: 10000,
    });

    let html: string;
    if (site.encoding === 'euc-kr') {
      html = iconv.decode(Buffer.from(response.data), 'EUC-KR');
    } else {
      html = response.data;
    }

    const $ = cheerio.load(html);

    // 게시글 목록으로 보이는 요소들 찾기
    console.log('\n[가능한 선택자]');

    // 테이블 기반
    if ($('table').length > 0) {
      console.log(`- table 태그: ${$('table').length}개`);
      $('table').each((i, el) => {
        const classes = $(el).attr('class') || '(no class)';
        const rows = $(el).find('tr').length;
        console.log(`  [${i}] class="${classes}", rows=${rows}`);
      });
    }

    // 리스트 기반
    if ($('div[class*="list"]').length > 0) {
      console.log(`- div[class*="list"]: ${$('div[class*="list"]').length}개`);
      $('div[class*="list"]').each((i, el) => {
        const classes = $(el).attr('class') || '(no class)';
        console.log(`  [${i}] class="${classes}"`);
      });
    }

    // 첫 번째 링크들 샘플
    console.log('\n[첫 5개 링크 샘플]');
    $('a').slice(0, 5).each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim().slice(0, 50);
      console.log(`  [${i}] ${text}`);
      console.log(`      href="${href}"`);
    });

    // 제목으로 보이는 요소들
    console.log('\n[제목 가능성 있는 요소]');
    $('a').slice(0, 10).each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (text.length > 10 && text.length < 100) {
        const classes = $el.attr('class') || '(no class)';
        console.log(`  - "${text.slice(0, 50)}..." (class="${classes}")`);
      }
    });

  } catch (error: any) {
    console.error(`❌ 에러: ${error.message}`);
    if (error.response) {
      console.error(`   상태 코드: ${error.response.status}`);
    }
  }
}

async function main() {
  for (const site of sites) {
    await debugSite(site);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main().catch(console.error);
