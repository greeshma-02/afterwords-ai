import React, { useState } from "react";

export const GoogleIcon: React.FC = () => (
  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" aria-hidden>
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.91 3.22-1.91 4.21-1.27 1.27-3.23 2.59-7.25 2.59-6.41 0-11.66-5.18-11.66-11.59s5.25-11.59 11.66-11.59c3.48 0 6.12 1.36 8.1 3.29l2.31-2.31c-2.12-2.02-5.06-3.58-10.41-3.58-9.44 0-17.18 7.61-17.18 17s7.74 17 17.18 17c5.1 0 8.94-1.68 12.01-4.84 3.14-3.14 4.14-7.6 4.14-11.39 0-.81-.06-1.57-.18-2.31h-15.97z"
      fill="#EA4335"
    />
  </svg>
);

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

export const GoogleSignInButton: React.FC = () => (
  <button
    type="button"
    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-surface-container-high border border-white/10 hover:bg-surface-container-highest transition-all duration-300 group mb-8"
  >
    <GoogleIcon />
    <span className="text-sm text-on-surface font-sans font-medium">Continue with Google</span>
  </button>
);

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
    <span className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface-variant opacity-40 font-sans cursor-default">
      Privacy Policy
    </span>
    <span className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface-variant opacity-40 font-sans cursor-default">
      Terms of Service
    </span>
  </div>
);
