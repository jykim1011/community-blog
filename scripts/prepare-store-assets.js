const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../play-store-assets');

// 출력 디렉토리 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Play Store 자료 준비 중...\n');

// 1. 앱 아이콘 512x512 PNG 생성
async function createIcon() {
  console.log('📱 앱 아이콘 생성 중...');
  await sharp('resources/icon.png')
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'app-icon-512.png'));
  console.log('✅ app-icon-512.png 생성 완료');
}

// 2. 기능 그래픽 1024x500 생성 (선택사항)
async function createFeatureGraphic() {
  console.log('🎯 기능 그래픽 생성 중...');

  // 그라데이션 배경 생성
  const svg = `
    <svg width="1024" height="500">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6B8FFF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#A78BFA;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1024" height="500" fill="url(#grad1)" />
      <text x="512" y="220" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">통합 커뮤니티</text>
      <text x="512" y="300" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle" opacity="0.9">17개 커뮤니티를 한눈에</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outputDir, 'feature-graphic-1024x500.png'));
  console.log('✅ feature-graphic-1024x500.png 생성 완료');
}

async function main() {
  try {
    await createIcon();
    await createFeatureGraphic();

    console.log('\n✨ 완료! 생성된 파일:');
    console.log(`📂 ${outputDir}`);
    console.log('   - app-icon-512.png (앱 아이콘)');
    console.log('   - feature-graphic-1024x500.png (기능 그래픽)');
    console.log('\n📝 스크린샷은 실제 앱을 실행하여 촬영해주세요.');
    console.log('   권장 크기: 1080 x 1920 ~ 7680 (16:9 비율)');
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

main();
