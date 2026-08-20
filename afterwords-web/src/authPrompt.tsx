import React, { createContext, useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSignInRedirectPath } from "./authApi";
import LoginConfirmModal from "./LoginConfirmModal";
import { ROUTES } from "./routes";

interface AuthPromptOptions {
  returnTo?: string;
  title?: string;
  message?: string;
}

interface AuthPromptContextValue {
  promptLogin: (options?: AuthPromptOptions | string) => void;
}

const AuthPromptContext = createContext<AuthPromptContextValue | null>(null);

export const AuthPromptProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [returnTo, setReturnTo] = useState(ROUTES.home);
  const [title, setTitle] = useState("Sign in to continue");
  const [message, setMessage] = useState(
    "Sign in to save your books and reflections.",
  );

  const promptLogin = useCallback((options?: AuthPromptOptions | string) => {
    const config =
      typeof options === "string" ? { returnTo: options } : (options ?? {});

    setReturnTo(config.returnTo ?? ROUTES.home);
    setTitle(config.title ?? "Sign in to continue");
    setMessage(
      config.message ?? "Sign in to save your books and reflections.",
    );
    setOpen(true);
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    navigate(getSignInRedirectPath(returnTo));
  };

  return (
    <AuthPromptContext.Provider value={{ promptLogin }}>
      {children}
      <LoginConfirmModal
        open={open}
        title={title}
        message={message}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </AuthPromptContext.Provider>
  );
};

export function useAuthPrompt(): AuthPromptContextValue {
  const context = useContext(AuthPromptContext);
  if (!context) {
    throw new Error("useAuthPrompt must be used within AuthPromptProvider");
  }
  return context;
}
