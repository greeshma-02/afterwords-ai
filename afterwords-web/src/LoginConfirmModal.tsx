import React, { useEffect } from "react";

interface LoginConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const LoginConfirmModal: React.FC<LoginConfirmModalProps> = ({
  open,
  title = "Sign in to continue",
  message = "Sign in to save your books and reflections.",
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-confirm-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-surface-dark shadow-2xl p-6 md:p-8">
        <span className="material-symbols-outlined text-primary text-3xl mb-4 block">
          login
        </span>
        <h2
          id="login-confirm-title"
          className="text-xl font-bold text-cream font-display mb-2"
        >
          {title}
        </h2>
        <p className="text-sm text-on-surface-variant font-sans leading-relaxed mb-8">
          {message}
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-lg border border-white/10 text-cream font-sans text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-3 rounded-lg bg-primary text-background-dark font-sans text-sm font-bold hover:brightness-110 transition-all"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginConfirmModal;
