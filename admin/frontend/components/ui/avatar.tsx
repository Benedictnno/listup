import React from "react";

export function Avatar({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = "", className = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} {...props} />;
}

export function AvatarFallback({ className = "", children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`text-sm font-medium text-muted-foreground ${className}`} {...props}>
      {children}
    </span>
  );
}