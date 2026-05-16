'use client';

interface ViewerToolbarProps {
  siteName: string;
  siteColor: string;
  url: string;
  onBack: () => void;
}

export function ViewerToolbar({ siteName, siteColor, url, onBack }: ViewerToolbarProps) {
  const hostname = (() => {
    try { return new URL(url).hostname; } catch { return url; }
  })();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0,
        height: 48,
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: 'var(--accent-tint)',
          color: 'var(--accent)',
          border: 'none',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 13,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        ← 목록
      </button>

      <div
        style={{
          flex: 1,
          background: 'var(--surface-2)',
          borderRadius: 6,
          padding: '4px 8px',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 11, color: siteColor }}>
          {siteName}
        </span>
        <span
          style={{
            fontSize: 11,
            color: 'var(--fg-4)',
            marginLeft: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {hostname}
        </span>
      </div>

      <button
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        title="새 탭으로 열기"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--fg-3)',
          fontSize: 16,
          cursor: 'pointer',
          flexShrink: 0,
          padding: '4px 6px',
          lineHeight: 1,
        }}
      >
        ↗
      </button>
    </div>
  );
}
