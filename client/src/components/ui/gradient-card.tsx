import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type GradientVariant = "green" | "blue" | "amber" | "purple" | "red" | "default";

interface GradientCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: GradientVariant;
  trend?: {
    value: number;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
  delay?: number;
}

const variantStyles: Record<GradientVariant, { card: string; icon: string; value: string }> = {
  green: {
    card: "gradient-card-green",
    icon: "bg-green-500/20 text-green-600 dark:text-green-400",
    value: "text-green-600 dark:text-green-400",
  },
  blue: {
    card: "gradient-card-blue",
    icon: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    value: "text-blue-600 dark:text-blue-400",
  },
  amber: {
    card: "gradient-card-amber",
    icon: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
  },
  purple: {
    card: "gradient-card-purple",
    icon: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    value: "text-purple-600 dark:text-purple-400",
  },
  red: {
    card: "gradient-card-red",
    icon: "bg-red-500/20 text-red-600 dark:text-red-400",
    value: "text-red-600 dark:text-red-400",
  },
  default: {
    card: "bg-card border-border",
    icon: "bg-primary/10 text-primary",
    value: "text-primary",
  },
};

export function GradientCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
  onClick,
  className,
  delay = 0,
}: GradientCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        transition: { duration: 0.2 } 
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl p-4 md:p-5 cursor-pointer",
        "transition-shadow duration-300",
        "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
        styles.card,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-xs md:text-sm font-medium text-muted-foreground truncate">
            {title}
          </span>
          <motion.span 
            className={cn("text-2xl md:text-3xl font-bold tracking-tight", styles.value)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2, duration: 0.4 }}
          >
            {value}
          </motion.span>
          {subtitle && (
            <span className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </span>
          )}
          {trend && (
            <motion.div 
              className="flex items-center gap-1 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.4 }}
            >
              <span className={cn(
                "text-xs font-medium",
                trend.value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {trend.value >= 0 ? "+" : ""}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              )}
            </motion.div>
          )}
        </div>
        {Icon && (
          <motion.div 
            className={cn(
              "p-2.5 md:p-3 rounded-xl shrink-0",
              styles.icon
            )}
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ 
              delay: delay + 0.1, 
              duration: 0.4,
              type: "spring",
              stiffness: 200,
            }}
          >
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
          </motion.div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.div>
  );
}
