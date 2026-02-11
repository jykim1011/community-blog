export async function register() {
  // Node.js 런타임에서만 실행 (Edge 제외)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startAutoCrawl } = await import('./lib/cron/auto-crawl');
    startAutoCrawl();
  }
}
