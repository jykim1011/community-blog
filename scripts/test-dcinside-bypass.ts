import axios from 'axios';
import * as cheerio from 'cheerio';

// 랜덤 딜레이 함수 (3-7초)
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
  console.log(`⏳ Waiting ${delay / 1000}s...`);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// 테스트 1: 강화된 헤더 + 랜덤 딜레이
async function test1_EnhancedHeaders() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 1: 강화된 브라우저 헤더 + 랜덤 딜레이');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
  ];

  try {
    const url = 'https://gall.dcinside.com/board/lists/?id=dcbest';
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    console.log(`🌐 URL: ${url}`);
    console.log(`🤖 User-Agent: ${userAgent.substring(0, 50)}...`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.dcinside.com/',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    console.log(`✅ 성공! 상태 코드: ${response.status}`);
    console.log(`📄 응답 크기: ${response.data.length} bytes`);

    // 게시글 수 확인
    const $ = cheerio.load(response.data);
    const posts = $('tr.ub-content').length;
    console.log(`📝 게시글 수: ${posts}개`);

    return true;
  } catch (error: any) {
    console.log(`❌ 실패: ${error.message}`);
    if (error.response) {
      console.log(`   상태 코드: ${error.response.status}`);
    }
    return false;
  }
}

// 테스트 2: 모바일 User-Agent
async function test2_MobileUserAgent() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 2: 모바일 User-Agent');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const url = 'https://m.dcinside.com/board/dcbest';
    const mobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

    console.log(`🌐 URL: ${url}`);
    console.log(`📱 User-Agent: ${mobileUA.substring(0, 50)}...`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': mobileUA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      timeout: 15000,
    });

    console.log(`✅ 성공! 상태 코드: ${response.status}`);
    console.log(`📄 응답 크기: ${response.data.length} bytes`);

    const $ = cheerio.load(response.data);
    const posts = $('ul.gall_list li').length;
    console.log(`📝 게시글 수: ${posts}개`);

    return true;
  } catch (error: any) {
    console.log(`❌ 실패: ${error.message}`);
    return false;
  }
}

// 테스트 3: API 엔드포인트 확인
async function test3_APIEndpoint() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 3: API 엔드포인트 시도');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const apiEndpoints = [
    'https://gall.dcinside.com/api/board/lists/?id=dcbest',
    'https://app.dcinside.com/api/board_lists?id=dcbest',
    'https://m.dcinside.com/api/board/lists?id=dcbest',
  ];

  for (const url of apiEndpoints) {
    try {
      console.log(`\n🔍 시도: ${url}`);

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'DCInside/5.0 (Android; Mobile)',
          'Accept': 'application/json',
        },
        timeout: 10000,
        validateStatus: (status) => status < 500,
      });

      console.log(`✅ 응답: ${response.status}`);
      console.log(`📄 Content-Type: ${response.headers['content-type']}`);

      if (response.status === 200 && response.headers['content-type']?.includes('json')) {
        console.log(`🎉 JSON API 발견!`);
        console.log(`📝 응답 샘플: ${JSON.stringify(response.data).substring(0, 200)}...`);
        return true;
      }
    } catch (error: any) {
      console.log(`❌ ${error.message}`);
    }
  }

  return false;
}

// 테스트 4: 쿠키 사용
async function test4_WithCookies() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('테스트 4: 쿠키 포함 요청');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1단계: 메인 페이지 방문하여 쿠키 획득
    console.log('1️⃣ 메인 페이지 방문...');
    const mainResponse = await axios.get('https://www.dcinside.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const cookies = mainResponse.headers['set-cookie'];
    console.log(`🍪 쿠키 획득: ${cookies?.length || 0}개`);

    await randomDelay(2, 3);

    // 2단계: 쿠키와 함께 게시판 접근
    console.log('2️⃣ 게시판 접근...');
    const boardResponse = await axios.get('https://gall.dcinside.com/board/lists/?id=dcbest', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': cookies?.join('; ') || '',
        'Referer': 'https://www.dcinside.com/',
      },
      timeout: 15000,
    });

    console.log(`✅ 성공! 상태 코드: ${boardResponse.status}`);
    console.log(`📄 응답 크기: ${boardResponse.data.length} bytes`);

    const $ = cheerio.load(boardResponse.data);
    const posts = $('tr.ub-content').length;
    console.log(`📝 게시글 수: ${posts}개`);

    return true;
  } catch (error: any) {
    console.log(`❌ 실패: ${error.message}`);
    return false;
  }
}

// 메인 실행
async function main() {
  console.log('🤖 디시인사이드 크롤링 차단 우회 테스트');
  console.log('=' .repeat(50));

  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
  };

  // 테스트 1: 강화된 헤더
  results.test1 = await test1_EnhancedHeaders();
  await randomDelay(3, 5);

  // 테스트 2: 모바일
  results.test2 = await test2_MobileUserAgent();
  await randomDelay(3, 5);

  // 테스트 3: API
  results.test3 = await test3_APIEndpoint();
  await randomDelay(3, 5);

  // 테스트 4: 쿠키
  results.test4 = await test4_WithCookies();

  // 결과 요약
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 테스트 결과 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`테스트 1 (강화된 헤더): ${results.test1 ? '✅ 성공' : '❌ 실패'}`);
  console.log(`테스트 2 (모바일 UA): ${results.test2 ? '✅ 성공' : '❌ 실패'}`);
  console.log(`테스트 3 (API 엔드포인트): ${results.test3 ? '✅ 성공' : '❌ 실패'}`);
  console.log(`테스트 4 (쿠키 포함): ${results.test4 ? '✅ 성공' : '❌ 실패'}`);

  const successCount = Object.values(results).filter(Boolean).length;
  console.log(`\n총 ${successCount}/4개 테스트 성공`);

  if (successCount === 0) {
    console.log('\n🚫 모든 방법 실패 - Puppeteer/Selenium 필요');
  } else {
    console.log('\n✅ 우회 가능한 방법 발견!');
  }
}

main().catch(console.error);
