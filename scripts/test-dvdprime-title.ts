import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://dvdprime.com/g2/bbs/board.php?bo_table=comm';
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);

  const firstRow = $('div.list_table_row').not('.list_table_row_notice').first();
  const titleLink = firstRow.find('.list_table_col_subject a').eq(1);

  console.log('링크 HTML:', titleLink.html()?.slice(0, 500));
  console.log('\n링크 텍스트 (text()):', titleLink.text().trim());
  console.log('\n링크 텍스트 (clone+remove+text):', titleLink.clone().children().remove().end().text().trim());
  console.log('\n링크 텍스트 (직접):', titleLink.contents().filter(function() { return this.type === 'text'; }).text().trim());
}

main().catch(console.error);
