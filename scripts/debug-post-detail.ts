import axios from 'axios';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';

async function debugQuasarzone() {
  console.log('\n========== QUASARZONE 상세 분석 ==========');
  const url = 'https://quasarzone.com/bbs/qb_saleinfo';

  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);

  console.log('\n[market-info-list 내부 구조]');
  const firstItem = $('div.market-info-list').first();
  console.log('클래스:', firstItem.attr('class'));
  console.log('HTML 샘플:', firstItem.html()?.slice(0, 500));

  console.log('\n[링크 찾기]');
  firstItem.find('a').each((i, el) => {
    const $el = $(el);
    console.log(`  [${i}] href="${$el.attr('href')}" class="${$el.attr('class')}" text="${$el.text().trim().slice(0, 50)}"`);
  });
}

async function debugDealbada() {
  console.log('\n========== DEALBADA 상세 분석 ==========');
  const url = 'http://www.dealbada.com/bbs/board.php?bo_table=deal_domestic';

  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    responseType: 'arraybuffer',
    timeout: 10000,
  });

  const html = iconv.decode(Buffer.from(response.data), 'EUC-KR');
  const $ = cheerio.load(html);

  console.log('\n[hoverTable 내부 구조]');
  const rows = $('table.hoverTable tbody tr').slice(0, 3);
  rows.each((i, row) => {
    const $row = $(row);
    console.log(`\n[행 ${i}]`);
    $row.find('td').each((j, td) => {
      const $td = $(td);
      console.log(`  td[${j}] class="${$td.attr('class')}" text="${$td.text().trim().slice(0, 30)}"`);
    });

    const link = $row.find('a').first();
    if (link.length) {
      console.log(`  링크: href="${link.attr('href')}" text="${link.text().trim().slice(0, 50)}"`);
    }
  });
}

async function debugDvdprime() {
  console.log('\n========== DVDPRIME 상세 분석 ==========');
  const url = 'https://dvdprime.com/g2/bbs/board.php?bo_table=comm';

  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000,
  });

  const $ = cheerio.load(response.data);

  console.log('\n[list_table_row 내부 구조]');
  const rows = $('div.list_table_row').not('.list_table_row_notice').slice(0, 2);
  rows.each((i, row) => {
    const $row = $(row);
    console.log(`\n[행 ${i}] class="${$row.attr('class')}"`);

    const subject = $row.find('.list_table_col_subject a').first();
    const date = $row.find('.list_table_col_date').first();
    const recommend = $row.find('.list_table_col_recommend').first();
    const hit = $row.find('.list_table_col_hit').first();
    const name = $row.find('.list_table_col_name').first();

    console.log(`  제목 링크: href="${subject.attr('href')}" text="${subject.text().trim().slice(0, 50)}"`);
    console.log(`  날짜: "${date.text().trim()}"`);
    console.log(`  추천: "${recommend.text().trim()}"`);
    console.log(`  조회: "${hit.text().trim()}"`);
    console.log(`  작성자: "${name.text().trim()}"`);
  });
}

async function main() {
  try {
    await debugQuasarzone();
  } catch (e: any) {
    console.error('Quasarzone 에러:', e.message);
  }

  await new Promise(r => setTimeout(r, 2000));

  try {
    await debugDealbada();
  } catch (e: any) {
    console.error('Dealbada 에러:', e.message);
  }

  await new Promise(r => setTimeout(r, 2000));

  try {
    await debugDvdprime();
  } catch (e: any) {
    console.error('DVDPrime 에러:', e.message);
  }
}

main().catch(console.error);
