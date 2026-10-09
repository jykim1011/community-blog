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
    <div
      className="overflow-x-auto scrollbar-hide touch-pan-x"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', width: 'max-content' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 2,
          fontSize: 12, fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap',
        }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l6-6 4 4 8-8" />
            <path d="M14 7h7v7" />
          </svg>
          급상승
        </span>

        {activeKeyword && !keywords.some(k => k.word === activeKeyword) && (
          <Chip label={activeKeyword} active onClick={() => onPick(null)} />
        )}

        {keywords.slice(0, 8).map((kw, i) => {
          const active = activeKeyword === kw.word;
          return (
            <Chip
              key={kw.word}
              rank={i + 1}
              label={kw.word}
              active={active}
              onClick={() => onPick(active ? null : kw.word)}
            />
          );
        })}
      </div>
    </div>
  );
}

function Chip({ label, rank, active, onClick }: {
  label: string; rank?: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
        padding: '5px 10px', borderRadius: 999, cursor: 'pointer', border: 'none',
        background: active ? 'var(--fg)' : 'var(--surface-2)',
        color: active ? 'var(--surface)' : 'var(--fg-2)',
        transition: 'background .15s ease, color .15s ease',
        flexShrink: 0,
      }}
    >
      {rank !== undefined && (
        <span style={{
          fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 11.5,
          color: active ? 'inherit' : rank <= 3 ? 'var(--hot)' : 'var(--fg-4)',
          opacity: active ? 0.7 : 1,
        }}>
          {rank}
        </span>
      )}
      {label}
      {active && <span aria-hidden style={{ marginLeft: 1, opacity: 0.7 }}>✕</span>}
    </button>
  );
}
