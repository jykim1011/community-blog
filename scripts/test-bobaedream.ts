import axios from 'axios';
import * as cheerio from 'cheerio';

(async () => {
  try {
    console.log('Fetching bobaedream best board...\n');

    const response = await axios.get('https://www.bobaedream.co.kr/list?code=best', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bobaedream.co.kr'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const totalRows = $('table#boardlist tbody tr').length;
    console.log('Total rows found:', totalRows);

    // 첫 5개 게시글 샘플
    let validCount = 0;
    $('table#boardlist tbody tr').each((i, el) => {
      if (validCount >= 5) return false;
      const $el = $(el);

      const titleLink = $el.find('td.pl14 a.bsubject').first();
      const title = titleLink.attr('title') || titleLink.text().trim();
      const url = titleLink.attr('href');
      const views = $el.find('td.count').text().trim();
      const comments = $el.find('strong.totreply').text().trim();
      const likes = $el.find('td.recomm font').text().trim();

      if (title && url) {
        console.log(`\n[${validCount + 1}] ${title}`);
        console.log(`    URL: ${url}`);
        console.log(`    Views: ${views}, Comments: ${comments}, Likes: ${likes}`);
        validCount++;
      }
    });

    console.log(`\n✅ Valid posts found: ${validCount}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
})();
