/**
 * 빌드 후 RSC 프리페치 경로 보정
 *
 * next build (output: 'export') 는 RSC 페이로드를
 *   out/hot/__next.hot/__PAGE__.txt
 * 처럼 디렉토리로 내보내지만, 클라이언트는
 *   /hot/__next.hot.__PAGE__.txt
 * 로 요청한다. 그대로 두면 모든 프리페치가 404 가 되어
 * 링크 이동이 클라이언트 라우팅 대신 전체 페이지 로드로 떨어진다.
 *
 * 정적 호스팅(Cloudflare Pages)에서는 리라이트로 표현하기 어려우므로
 * 평탄화한 이름의 복사본을 함께 만들어 둔다.
 */
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'out');

function walk(dir: string, onFile: (full: string) => void) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, onFile);
    else onFile(full);
  }
}

function main() {
  if (!fs.existsSync(OUT)) {
    console.warn('[postbuild] out/ 이 없어 건너뜁니다.');
    return;
  }

  let created = 0;

  const visit = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const full = path.join(dir, entry.name);

      if (entry.name.startsWith('__next.')) {
        // 이 디렉토리 안의 모든 파일을 부모 디렉토리에 평탄화된 이름으로 복사
        walk(full, (file) => {
          const rel = path.relative(full, file).split(path.sep).join('.');
          const alias = path.join(dir, `${entry.name}.${rel}`);
          if (!fs.existsSync(alias)) {
            fs.copyFileSync(file, alias);
            created++;
          }
        });
      } else {
        visit(full);
      }
    }
  };

  visit(OUT);
  console.log(`[postbuild] RSC 프리페치 별칭 ${created}개 생성`);
}

main();
