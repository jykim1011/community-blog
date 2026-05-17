# iframe 프리로드 설계 (2026-05-17)

## 목표

게시글 뷰어 iframe의 체감 로딩 속도 개선.  
`touchstart` 시점(탭 확정 0.1~0.3초 전)에 숨겨진 iframe으로 미리 로딩을 시작해, 뷰어가 열릴 때 브라우저 HTTP 캐시와 in-flight 요청을 그대로 재활용한다.

대상 플랫폼: Android 앱 (Capacitor) + 모바일 웹 브라우저.

---

## 변경 파일

| 파일 | 변경 내용 |
|---|---|
| `lib/contexts/viewer-context.tsx` | `preloadUrl` 상태 + `preloadViewer` / `cancelPreload` 함수 추가 |
| `components/viewer-overlay.tsx` | `preloadUrl` 있을 때 숨겨진 프리로드 iframe 렌더링 |
| `components/post-card.tsx` | `onTouchStart` / `onTouchMove` / `onTouchCancel` 핸들러 추가 |

---

## ViewerContext

```typescript
interface ViewerContextValue {
  viewer: ViewerState | null;
  openViewer: (state: ViewerState) => void;
  closeViewer: () => void;
  preloadUrl: string | null;          // 추가
  preloadViewer: (url: string) => void; // 추가
  cancelPreload: () => void;           // 추가
}
```

- `preloadViewer(url)`: `preloadUrl` 상태를 해당 url로 설정
- `cancelPreload()`: `preloadUrl`을 null로 초기화
- `openViewer()`: viewer 상태 설정 + `preloadUrl` null로 초기화 (숨겨진 iframe 제거)

---

## ViewerOverlay — 숨겨진 프리로드 iframe

`viewer`가 null이고 `preloadUrl`이 있을 때만 렌더링한다.

```tsx
{!viewer && preloadUrl && (
  <iframe
    src={preloadUrl}
    style={{
      position: 'fixed',
      width: 0,
      height: 0,
      opacity: 0,
      border: 'none',
      pointerEvents: 'none',
    }}
    aria-hidden="true"
    tabIndex={-1}
  />
)}
```

**`display:none` 사용 금지**: Android WebView에서 iframe 로딩을 중단시킴.  
대신 `position:fixed; width:0; height:0; opacity:0`으로 화면에서 완전히 숨기되 로딩은 유지.

`preloadUrl`이 null이 되면 iframe이 언마운트되어 네트워크 요청이 자동으로 중단된다.

---

## PostCard — 터치 핸들러

```typescript
const touchStartPos = useRef<{ x: number; y: number } | null>(null);

const handleTouchStart = (e: React.TouchEvent) => {
  if (isDomainBlocked(url)) return;  // 차단 도메인은 프리로드 안 함
  const t = e.touches[0];
  touchStartPos.current = { x: t.clientX, y: t.clientY };
  preloadViewer(url);
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (!touchStartPos.current) return;
  const t = e.touches[0];
  const dx = t.clientX - touchStartPos.current.x;
  const dy = t.clientY - touchStartPos.current.y;
  if (dx * dx + dy * dy > 25) {  // 5px 이상 이동 = 스크롤 제스처
    cancelPreload();
    touchStartPos.current = null;
  }
};

const handleTouchCancel = () => {
  cancelPreload();
  touchStartPos.current = null;
};
```

`<a>` 태그에 `onTouchStart`, `onTouchMove`, `onTouchCancel` 세 핸들러를 추가한다.  
`onClick` (= 탭 확정)은 기존 로직 그대로 유지.

---

## 동작 흐름 요약

```
touchstart  → preloadViewer(url)
               ↓
           ViewerOverlay: 숨겨진 iframe 렌더링
               ↓
           외부 사이트 DNS + TCP + TLS + HTTP 로딩 시작

touchmove > 5px → cancelPreload() → iframe 언마운트 → 요청 중단

click (탭 확정) → openViewer()
                   ↓
               viewer iframe 렌더링 (같은 URL)
                   ↓
               브라우저 캐시 + in-flight 요청 재활용
                   ↓
               "불러오는 중..." 시간 대폭 단축
```

---

## 제약 사항

- **차단 도메인** (`BLOCKED_DOMAINS`): 어차피 외부 브라우저로 열리므로 프리로드하지 않음
- **단일 슬롯**: 한 번에 하나의 URL만 프리로드. 연속 touchstart 시 마지막 URL로 덮어씀 (단순 상태 덮어쓰기로 처리)
- **`useRef` 사용**: `touchStartPos`는 렌더링을 유발할 필요가 없으므로 ref 사용
- **접근성**: 프리로드 iframe에 `aria-hidden="true"` + `tabIndex={-1}` 적용
