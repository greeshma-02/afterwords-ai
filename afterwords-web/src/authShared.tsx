import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { googleSignIn } from "./authApi";
import { ROUTES } from "./routes";

interface AuthDividerProps {
  label?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({ label = "OR" }) => (
  <div className="relative flex items-center mb-8">
    <div className="flex-grow border-t border-white/5" />
    <span className="flex-shrink mx-4 text-xs uppercase tracking-[0.2em] font-bold text-on-surface-variant opacity-40 font-sans">
      {label}
    </span>
    <div className="flex-grow border-t border-white/5" />
  </div>
);

interface GoogleSignInButtonProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await googleSignIn({ accessToken: tokenResponse.access_token });
        onSuccess();
      } catch (e) {
        onError(e instanceof Error ? e.message : "Google sign-in failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => onError("Google sign-in failed."),
  });

  return (
    <div className="mb-8 w-full">
      <button
        type="button"
        onClick={() => login()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-surface-dark hover:bg-surface-container-highest border border-white/5 py-3.5 rounded-lg transition-all duration-300 disabled:opacity-60 font-sans text-on-surface"
      >
        <FcGoogle size={22} />
        <span>{loading ? "Signing in…" : "Continue with Google"}</span>
      </button>
    </div>
  );
};

interface AuthFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showToggle?: boolean;
  visible?: boolean;
  onToggleVisibility?: () => void;
  labelExtra?: React.ReactNode;
}

export const AuthField: React.FC<AuthFieldProps> = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  showToggle,
  visible,
  onToggleVisibility,
  labelExtra,
}) => {
  const [focused, setFocused] = useState(false);

  const labelClass = `block text-xs uppercase tracking-[0.2em] font-bold ml-1 font-sans transition-colors ${
    focused ? "text-primary" : "text-on-surface-variant"
  }`;

  return (
    <div>
      {labelExtra ? (
        <div className="flex justify-between items-center mb-2">
          <label htmlFor={id} className={labelClass}>
            {label}
          </label>
          {labelExtra}
        </div>
      ) : (
        <label htmlFor={id} className={`${labelClass} mb-2`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={showToggle && !visible ? "password" : type}
          className="w-full bg-surface-dark border border-white/5 rounded-lg px-4 py-3 text-on-surface placeholder:text-accent-brass/30 font-sans text-base focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all outline-none"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors text-[20px]"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? "visibility_off" : "visibility"}
          </button>
        )}
      </div>
    </div>
  );
};

export const AuthLegalLinks: React.FC = () => (
  <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-4 justify-center md:justify-start">
    <Link
      to={ROUTES.privacy}
      className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary transition-colors font-sans"
    >
      Privacy Policy
    </Link>
    <Link
      to={ROUTES.terms}
      className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary transition-colors font-sans"
    >
      Terms of Service
    </Link>
  </div>
);
