import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 빌드 산출물·복사된 웹 번들 (cap sync가 out/ 을 android/ 로 복사한다)
    "android/**",
    // 내려받은 디자인 시스템 내보내기 (직접 작성한 코드가 아님)
    "store-assets/**/*_files/**",
  ]),
  // 이미지는 모두 외부 사이트의 파비콘·썸네일이고, output: 'export' 라 next/image 최적화 서버가 없다.
  // <Image unoptimized> 로 바꿔도 결국 같은 <img> 가 나오므로 이 규칙은 끈다
  {
    rules: { "@next/next/no-img-element": "off" },
  },
  // Node 로 바로 실행하는 CommonJS 스크립트는 require() 를 쓴다
  {
    files: ["scripts/**/*.js", "store-assets/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);

export default eslintConfig;
