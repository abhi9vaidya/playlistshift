import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, leftElement, rightElement, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center w-full">
          {leftElement && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-textMuted">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-[#11131A] text-white placeholder-textSubtle rounded-xl border transition-all duration-200 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brandGreen/40 focus:border-brandGreen/80 disabled:opacity-50 disabled:cursor-not-allowed ${
              leftElement ? "pl-11" : ""
            } ${rightElement ? "pr-11" : ""} ${
              error
                ? "border-brandRed focus:border-brandRed focus:ring-brandRed/40"
                : "border-border hover:border-[#2C3242]"
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-brandRed font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

