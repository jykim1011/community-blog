import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://dvdprime.com/g2/bbs/board.php?bo_table=comm';
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);
  const posts: any[] = [];

  $('div.list_table_row').not('.list_table_row_notice').each((i, element) => {
    const $el = $(element);

    console.log(`\n처리 중: ${i}`);

    const titleLink = $el.find('.list_table_col_subject a').eq(1);
    const title = titleLink.clone().children().remove().end().text().trim();
    const href = titleLink.attr('href');

    console.log('  제목:', title);
    console.log('  URL:', href);

    if (!title || !href) {
      console.log('  ❌ 제목 또는 URL 없음');
      return;
    }

    const author = $el.find('.list_table_col_name').text().trim();
    const viewText = $el.find('.list_table_col_hit').text().trim();
    const likeText = $el.find('.list_table_col_recommend').text().trim();
    const dateText = $el.find('.list_table_col_date').text().trim();

    console.log('  작성자:', author);
    console.log('  조회수:', viewText);
    console.log('  추천:', likeText);
    console.log('  날짜:', dateText);

    posts.push({ title, href, author });
  });

  console.log(`\n총 ${posts.length}개 게시글 수집`);
}

main().catch(console.error);
