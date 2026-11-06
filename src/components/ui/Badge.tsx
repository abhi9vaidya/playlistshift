import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "purple" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "default",
  children,
  ...props
}) => {
  const variantStyles = {
    default: "bg-surfaceHover text-textMuted border-border",
    success: "bg-brandGreen/10 text-brandGreen border-brandGreen/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    danger: "bg-brandRed/10 text-brandRed border-brandRed/30",
    purple: "bg-brandPurple/10 text-brandPurple border-brandPurple/30",
    outline: "bg-transparent text-textMuted border-border",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
