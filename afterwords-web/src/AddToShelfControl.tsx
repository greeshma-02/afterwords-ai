import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { isAuthenticated } from "./authApi";
import { useAuthPrompt } from "./authPrompt";
import {
  addToShelf,
  SHELF_STATUS_OPTIONS,
  shelfStatusLabel,
  type ShelfStatus,
} from "./shelfApi";

interface AddToShelfControlProps {
  bookId: number;
  /** Compact bookmark trigger (home cards) vs full button (book detail) */
  variant?: "button" | "icon";
  iconSize?: "sm" | "md";
  className?: string;
  savedStatus?: ShelfStatus | null;
  onSaved?: (status: ShelfStatus) => void;
}

const AddToShelfControl: React.FC<AddToShelfControlProps> = ({
  bookId,
  variant = "button",
  iconSize = "sm",
  className = "",
  savedStatus: controlledStatus,
  onSaved,
}) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localStatus, setLocalStatus] = useState<ShelfStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const location = useLocation();
  const { promptLogin } = useAuthPrompt();

  const savedStatus = controlledStatus !== undefined ? controlledStatus : localStatus;

  const ensureAuth = (): boolean => {
    if (isAuthenticated()) return true;
    promptLogin({
      returnTo: location.pathname,
      title: "Sign in to add to your shelf",
      message: "Sign in to save books to your personal shelf.",
    });
    return false;
  };

  const handleOpen = () => {
    if (!ensureAuth()) return;
    setOpen((value) => !value);
  };

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const menuWidth = 224;
    const left =
      variant === "icon" ? rect.right - menuWidth : rect.left;

    setMenuPosition({
      top: rect.bottom + 8,
      left: Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8)),
    });
  }, [variant]);

  useEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSelect = async (status: ShelfStatus) => {
    if (saving || !ensureAuth()) return;
    setSaving(true);
    setError(null);
    try {
      const item = await addToShelf(bookId, status);
      setLocalStatus(item.status);
      onSaved?.(item.status);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add to shelf.");
    } finally {
      setSaving(false);
    }
  };

  const triggerLabel = savedStatus
    ? `On shelf · ${shelfStatusLabel(savedStatus)}`
    : saving
      ? "Adding…"
      : "Add to My Shelf";

  const iconClass =
    iconSize === "md"
      ? "size-9 text-lg"
      : "size-7 text-sm";

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      {variant === "button" ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          disabled={saving}
          className="bg-surface-dark text-cream border border-white/10 px-8 py-3.5 rounded-lg font-bold text-base hover:bg-white/5 transition-all flex items-center gap-2 disabled:opacity-60"
        >
          <span className="material-symbols-outlined">
            {savedStatus ? "bookmark_added" : "library_add"}
          </span>
          {triggerLabel}
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          disabled={saving}
          className={`flex items-center justify-center rounded-full border border-primary/20 text-primary/80 hover:text-primary hover:border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-60 ${iconClass}`}
          aria-label={
            savedStatus
              ? `On shelf as ${shelfStatusLabel(savedStatus)}`
              : "Save to Afterwords"
          }
          aria-expanded={open}
        >
          <span className="material-symbols-outlined text-[1em]">
            {savedStatus ? "bookmark_added" : "bookmark_add"}
          </span>
        </button>
      )}

      {open &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[100] w-56 rounded-xl border border-white/10 bg-surface-dark shadow-2xl overflow-hidden"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            role="menu"
          >
            <p className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-sans">
              Add as
            </p>
            {SHELF_STATUS_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="menuitem"
                disabled={saving}
                onClick={() => handleSelect(option.id)}
                className={`w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors disabled:opacity-60 border-t border-white/5 ${
                  savedStatus === option.id ? "bg-primary/10" : ""
                }`}
              >
                <span className="block text-sm font-bold text-cream font-sans">
                  {option.label}
                </span>
                <span className="block text-xs text-on-surface-variant font-sans mt-0.5">
                  {option.description}
                </span>
              </button>
            ))}
          </div>,
          document.body,
        )}

      {error && (
        <p
          className={`text-sm text-red-300 mt-2 ${
            variant === "icon" ? "absolute right-0 w-48 text-right" : ""
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default AddToShelfControl;
