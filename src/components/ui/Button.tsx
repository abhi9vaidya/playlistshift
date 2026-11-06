import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "purple" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 select-none rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090A0F] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5 shadow-lg",
    };

    const variantStyles = {
      primary:
        "bg-brandGreen text-black font-semibold hover:bg-brandGreen-hover focus:ring-brandGreen shadow-[0_0_20px_rgba(0,229,153,0.25)] hover:shadow-[0_0_25px_rgba(0,229,153,0.35)]",
      purple:
        "bg-brandPurple text-white font-semibold hover:bg-brandPurple-hover focus:ring-brandPurple shadow-[0_0_20px_rgba(139,92,246,0.25)]",
      secondary:
        "bg-surfaceHover text-white border border-border hover:bg-surfaceActive hover:border-textSubtle focus:ring-textSubtle",
      outline:
        "bg-transparent text-white border border-border hover:bg-surface hover:border-brandGreen/40 focus:ring-brandGreen",
      ghost:
        "bg-transparent text-textMuted hover:text-white hover:bg-surfaceHover focus:ring-textSubtle",
      danger:
        "bg-brandRed/20 text-brandRed border border-brandRed/30 hover:bg-brandRed/30 focus:ring-brandRed",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
