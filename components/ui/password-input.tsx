"use client";

import * as React from "react";
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength, value, onChange, defaultValue, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [localValue, setLocalValue] = React.useState((value || defaultValue || "") as string);
    
    const valStr = value !== undefined ? (value as string) : localValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
      if (onChange) onChange(e);
    };
    
    // Basic strength calculation
    const calculateStrength = (pass: string) => {
      let score = 0;
      if (!pass) return score;
      if (pass.length >= 8) score += 25;
      if (pass.length >= 12) score += 25;
      if (/[A-Z]/.test(pass)) score += 15;
      if (/[a-z]/.test(pass)) score += 15;
      if (/[0-9]/.test(pass)) score += 10;
      if (/[^A-Za-z0-9]/.test(pass)) score += 10;
      return score;
    };

    const strength = calculateStrength(valStr);

    let strengthLabel = "Weak";
    let strengthColor = "bg-destructive";
    if (strength >= 80) {
      strengthLabel = "Strong";
      strengthColor = "bg-emerald-500";
    } else if (strength >= 50) {
      strengthLabel = "Fair";
      strengthColor = "bg-yellow-500";
    }

    return (
      <div className="space-y-2 w-full">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            className={`pr-10 ${className}`}
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            {...props}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </button>
        </div>
        
        {showStrength && (
          <div className="space-y-1.5 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono uppercase tracking-wider text-[10px]">Password Strength</span>
              <span className={`font-bold ${strength >= 80 ? 'text-emerald-500' : strength >= 50 ? 'text-yellow-500' : 'text-destructive'}`}>
                {valStr.length === 0 ? "" : strengthLabel}
              </span>
            </div>
            <div className="h-1.5 w-full bg-input/30 rounded-full overflow-hidden flex gap-1">
              <div 
                className={`h-full transition-all duration-300 ${strengthColor}`} 
                style={{ width: `${Math.min(100, Math.max(0, strength))}%` }} 
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
