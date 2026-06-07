'use client';

import { useEffect, useState } from 'react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="sm:hidden fixed bottom-5 right-4 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-opacity"
      style={{ background: 'var(--accent, #4f46e5)', color: '#fff', opacity: 0.9 }}
      aria-label="맨 위로"
    >
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
