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
  // 정적 export 라 서버 HTML 과 첫 렌더가 같아야 해서, localStorage·UA·현재 시각처럼
  // 브라우저에서만 아는 값은 마운트 후 effect 에서 setState 로 넣는다 (의도된 패턴).
  // 새 코드에서 습관적으로 쓰지 않게 경고로는 남겨 둔다
  {
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  // Node 로 바로 실행하는 CommonJS 스크립트는 require() 를 쓴다
  {
    files: ["scripts/**/*.js", "store-assets/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);

export default eslintConfig;
