import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, Loader2 } from "lucide-react";

type GlowVariant = "primary" | "blue" | "amber" | "gradient";

interface GlowButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: GlowVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantStyles: Record<GlowVariant, string> = {
  primary: "btn-gradient",
  blue: "btn-gradient-blue",
  amber: "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-amber-500/40",
  gradient: "bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white",
};

const sizeStyles = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

export function GlowButton({ 
  children, 
  icon: Icon, 
  variant = "primary", 
  size = "md",
  loading = false,
  className,
  disabled,
  onClick,
  type = "button",
}: GlowButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "relative inline-flex items-center justify-center font-medium rounded-lg",
        "transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "shadow-lg hover:shadow-xl",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className={cn("shrink-0", size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
}
