import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "none" | "green" | "purple";
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className = "",
  glow = "none",
  hoverable = false,
  children,
  ...props
}) => {
  const glowStyles = {
    none: "",
    green: "hover:border-brandGreen/40 hover:shadow-[0_0_30px_rgba(0,229,153,0.1)]",
    purple: "hover:border-brandPurple/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]",
  };

  return (
    <div
      className={`bg-surface border border-border rounded-2xl p-6 transition-all duration-200 ${
        hoverable ? "hover:bg-surfaceHover/80" : ""
      } ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

