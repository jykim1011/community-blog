'use client';

interface Keyword {
  word: string;
}

interface TrendStripProps {
  keywords: Keyword[];
  activeKeyword: string | null;
  onPick: (word: string | null) => void;
}

export function TrendStrip({ keywords, activeKeyword, onPick }: TrendStripProps) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 0 4px' }}>

      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 18px 8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ color: 'var(--accent)', flexShrink: 0 }}>
            <path d="M3 17l6-6 4 4 8-8" />
            <path d="M14 7h7v7" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--fg-1)', whiteSpace: 'nowrap' }}>
            지금 뜨는 키워드
          </span>
        </div>

        {activeKeyword && (
          <button
            onClick={() => onPick(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: 'var(--accent)',
              padding: '2px 0', flexShrink: 0,
            }}
          >
            전체 보기 ×
          </button>
        )}
      </div>

      {/* 키워드 pills */}
      <div
        className="overflow-x-auto scrollbar-hide touch-pan-x"
        style={{ display: 'flex', gap: 8, padding: '0 18px 4px' }}
      >
        {keywords.slice(0, 8).map((kw, i) => {
          const active = activeKeyword === kw.word;
          return (
            <button
              key={kw.word}
              onClick={() => onPick(active ? null : kw.word)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                padding: '7px 13px 7px 10px', borderRadius: 999, cursor: 'pointer',
                border: '1px solid',
                borderColor: active ? 'transparent' : 'var(--border)',
                background: active ? 'var(--accent)' : 'var(--surface)',
                color: active ? '#fff' : 'var(--fg-2)',
                transition: 'all .15s ease',
                flexShrink: 0,
              }}
            >
              <span style={{
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 700,
                fontSize: 11.5,
                color: active
                  ? 'rgba(255,255,255,.75)'
                  : i < 3 ? 'var(--hot)' : 'var(--fg-4)',
              }}>
                {i + 1}
              </span>
              {kw.word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
