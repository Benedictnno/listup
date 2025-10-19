import React from "react";

type Variant = "default" | "secondary" | "outline" | "destructive" | "success" | "warning";

const variants: Record<Variant, string> = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-muted-foreground/20",
  destructive: "bg-red-100 text-red-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export default function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    />
  );
}