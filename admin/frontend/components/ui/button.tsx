import React from "react";

type Variant = "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-muted-foreground/20 hover:bg-muted",
  ghost: "hover:bg-muted",
  link: "text-primary underline-offset-4 hover:underline bg-transparent",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-11 px-6 text-base",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export default function Button({ variant = "default", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    />
  );
}