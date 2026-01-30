import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 
      className={cn("animate-spin text-primary", sizeClasses[size], className)} 
      data-testid="loading-spinner"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center" data-testid="page-loader">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="flex h-48 w-full items-center justify-center" data-testid="card-loader">
      <LoadingSpinner />
    </div>
  );
}
