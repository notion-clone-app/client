import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type KeyboardEvent,
  type PointerEvent,
  type PropsWithChildren,
  type ReactNode,
} from "react";

interface WorkspaceLayoutProps {
  asideNode: ReactNode | null;
}

const DEFAULT_SIDEBAR_WIDTH = 288;
const MIN_SIDEBAR_WIDTH = 224;
const MAX_SIDEBAR_WIDTH = 420;
const SIDEBAR_WIDTH_STORAGE_KEY = "workspace:sidebar-width";

const clampSidebarWidth = (width: number) =>
  Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));

const readSidebarWidth = () => {
  const storedWidth = Number(globalThis.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
  return Number.isFinite(storedWidth) && storedWidth > 0
    ? clampSidebarWidth(storedWidth)
    : DEFAULT_SIDEBAR_WIDTH;
};

export const WorkspaceLayout: FC<PropsWithChildren<WorkspaceLayoutProps>> = ({
  asideNode,
  children,
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(readSidebarWidth);
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    globalThis.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  const startResize = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = { startX: event.clientX, startWidth: sidebarWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const resize = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setSidebarWidth(
      clampSidebarWidth(drag.current.startWidth + event.clientX - drag.current.startX),
    );
  };

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      setSidebarWidth((current) =>
        clampSidebarWidth(current + (event.key === "ArrowLeft" ? -16 : 16)),
      );
    }
    if (event.key === "Home") setSidebarWidth(MIN_SIDEBAR_WIDTH);
    if (event.key === "End") setSidebarWidth(MAX_SIDEBAR_WIDTH);
  };

  const layoutStyle = {
    "--workspace-sidebar-width": `${sidebarWidth}px`,
  } as CSSProperties;

  return (
    <div className="flex min-h-dvh bg-background" style={layoutStyle}>
      {asideNode && (
        <aside className="fixed inset-y-0 left-0 z-20 hidden border-r border-gray-100 bg-white md:flex md:w-[var(--workspace-sidebar-width)]">
          {asideNode}
          <input
            type="range"
            aria-label="Resize workspace sidebar"
            min={MIN_SIDEBAR_WIDTH}
            max={MAX_SIDEBAR_WIDTH}
            value={sidebarWidth}
            readOnly
            className="workspace-sidebar-resizer absolute inset-y-0 -right-1 z-30 h-full w-2 cursor-col-resize touch-none appearance-none bg-transparent p-0 outline-none"
            onPointerDown={startResize}
            onPointerMove={resize}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onDoubleClick={() => setSidebarWidth(DEFAULT_SIDEBAR_WIDTH)}
            onKeyDown={resizeWithKeyboard}
          />
        </aside>
      )}
      <main className="min-h-dvh min-w-0 flex-1 md:ml-[var(--workspace-sidebar-width)]">
        {children}
      </main>
    </div>
  );
};
