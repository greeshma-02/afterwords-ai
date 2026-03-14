import React from "react";

const variantStyles = {
  primary:
    "bg-primary text-background-dark px-8 py-3.5 font-bold text-base hover:brightness-110 transition-all flex items-center gap-2",
  secondary:
    "bg-surface-dark text-cream border border-white/10 px-8 py-3.5 rounded-lg font-bold text-base hover:bg-white/5 transition-all flex items-center gap-2",
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary";
  icon?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  icon,
  children,
  className = "",
  type = "button",
  ...props
}) => {
  const baseStyles = variantStyles[variant];
  const iconBold = variant === "primary";

  return (
    <button
      type={type}
      className={`${baseStyles} ${className}`.trim()}
      {...props}
    >
      {icon && (
        <span
          className={`material-symbols-outlined ${iconBold ? "font-bold" : ""}`}
        >
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;
