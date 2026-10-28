import React from "react";

interface ClinicLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
  theme?: "light" | "dark" | "navy";
  className?: string;
}

export function ClinicLogo({
  size = "md",
  showText = true,
  subtitle = "Centre for Marine Medical Examinations",
  className = "",
}: ClinicLogoProps) {
  const imgSizes = {
    sm: "h-9 w-auto max-w-[55px]",
    md: "h-12 w-auto max-w-[75px]",
    lg: "h-16 w-auto max-w-[100px]",
    xl: "h-24 w-auto max-w-[145px]",
  }[size];

  const titleSizes = {
    sm: "text-xs font-bold leading-tight",
    md: "text-sm font-bold leading-tight",
    lg: "text-base font-bold tracking-tight",
    xl: "text-xl font-bold tracking-tight",
  }[size];

  const subSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
    xl: "text-xs",
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Sailor's Medical Clinic Logo */}
      <div className="relative shrink-0 flex items-center justify-center rounded-lg bg-white p-1 shadow-2xs border border-border/60">
        <img
          src="/logo.png"
          alt="Sailor's Medical Clinic Logo"
          className={`${imgSizes} object-contain`}
          loading="eager"
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="min-w-0">
          <div className={`${titleSizes} text-foreground flex items-center gap-1.5`}>
            <span>Sailors Medical Clinic</span>
          </div>
          {subtitle && (
            <div
              className={`${subSizes} font-medium text-muted-foreground uppercase tracking-wide truncate mt-0.5`}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
