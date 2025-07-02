// components/ui/skeleton.ts

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-dark-surface-hover", className)}
      {...props}
    />
  );
}

export { Skeleton };