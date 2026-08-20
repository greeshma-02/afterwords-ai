import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  removeFromShelf,
  SHELF_STATUS_OPTIONS,
  shelfStatusLabel,
  updateShelfItem,
  type ShelfItem,
  type ShelfStatus,
} from "./shelfApi";

interface ShelfItemMenuProps {
  item: ShelfItem;
  onUpdated: () => void;
  align?: "left" | "right";
}

const ShelfItemMenu: React.FC<ShelfItemMenuProps> = ({
  item,
  onUpdated,
  align = "right",
}) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(
    null,
  );

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuWidth = 224;
    const left =
      align === "right" ? rect.right - menuWidth : rect.left;

    setMenuPosition({
      top: rect.bottom + 8,
      left: Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8)),
    });
  }, [align]);

  useEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();
    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setOpen(false);
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = (status: ShelfStatus) => {
    if (status === item.status) {
      setOpen(false);
      return;
    }
    void runAction(() => updateShelfItem(item.bookId, { status }).then(() => undefined));
  };

  const handleProgress = (progressPercent: number) => {
    void runAction(() =>
      updateShelfItem(item.bookId, { progressPercent }).then(() => undefined),
    );
  };

  const handleRemove = () => {
    if (!window.confirm(`Remove "${item.title}" from your shelf?`)) return;
    void runAction(() => removeFromShelf(item.bookId));
  };

  const otherStatuses = SHELF_STATUS_OPTIONS.filter((option) => option.id !== item.status);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={busy}
        className="text-on-surface-variant hover:text-primary transition-opacity shrink-0 disabled:opacity-60"
        aria-label={`More options for ${item.title}`}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-lg">more_vert</span>
      </button>

      {open &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] w-56 rounded-lg border border-white/10 bg-surface-dark shadow-2xl overflow-hidden"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-accent-brass/60 font-bold font-sans border-b border-white/5">
              {shelfStatusLabel(item.status)}
            </p>
            {otherStatuses.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={busy}
                onClick={() => handleStatusChange(option.id)}
                className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors disabled:opacity-60 border-t border-white/5 font-sans text-sm text-on-surface"
              >
                Mark as {option.label}
              </button>
            ))}
            {item.status === "reading" && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleProgress(50)}
                  className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors disabled:opacity-60 border-t border-white/5 font-sans text-sm text-on-surface"
                >
                  Set progress to 50%
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleStatusChange("finished")}
                  className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors disabled:opacity-60 border-t border-white/5 font-sans text-sm text-on-surface"
                >
                  Mark as finished
                </button>
              </>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={handleRemove}
              className="w-full text-left px-4 py-3 hover:bg-red-500/10 transition-colors disabled:opacity-60 border-t border-white/5 font-sans text-sm text-red-300"
            >
              Remove from shelf
            </button>
            {error && (
              <p className="px-4 py-2 text-xs text-red-300 border-t border-white/5">{error}</p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ShelfItemMenu;
