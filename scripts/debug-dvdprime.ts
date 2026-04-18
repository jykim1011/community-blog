import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://dvdprime.com/g2/bbs/board.php?bo_table=comm';
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);

  console.log('[전체 list_table_row 수]', $('div.list_table_row').length);
  console.log('[공지 제외 list_table_row 수]', $('div.list_table_row').not('.list_table_row_notice').length);

  const rows = $('div.list_table_row').not('.list_table_row_notice').slice(0, 3);
  rows.each((i, row) => {
    const $row = $(row);
    console.log(`\n[행 ${i}]`);

    console.log('  전체 클래스:', $row.attr('class'));
    console.log('  .list_table_col_subject 개수:', $row.find('.list_table_col_subject').length);
    console.log('  .list_subject_subject 개수:', $row.find('.list_subject_subject').length);

    const subjectDiv = $row.find('.list_table_col_subject').first();
    console.log('  .list_table_col_subject HTML:', subjectDiv.html()?.slice(0, 300));

    const allLinks = $row.find('.list_table_col_subject a');
    console.log(`  .list_table_col_subject a 개수: ${allLinks.length}`);
    allLinks.each((j, link) => {
      const $link = $(link);
      console.log(`    [${j}] href="${$link.attr('href')}" text="${$link.text().trim().slice(0, 50)}"`);
    });

    const subjectLink = $row.find('.list_subject_subject a').first();
    console.log('  .list_subject_subject a:', {
      href: subjectLink.attr('href'),
      text: subjectLink.text().trim().slice(0, 50),
    });
  });
}

main().catch(console.error);
