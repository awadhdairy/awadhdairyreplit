import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Milk,
  Package,
  Receipt,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "Cattle", url: "/cattle", icon: Milk },
  { title: "Production", url: "/production", icon: Package },
  { title: "Billing", url: "/billing", icon: Receipt },
];

interface BottomNavigationProps {
  onMoreClick: () => void;
}

export function BottomNavigation({ onMoreClick }: BottomNavigationProps) {
  const [location] = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom"
      data-testid="bottom-navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.url || 
            (item.url !== "/dashboard" && location.startsWith(item.url));
          const Icon = item.icon;

          return (
            <Link key={item.url} href={item.url}>
              <motion.div
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl min-w-[60px] transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.95 }}
                data-testid={`nav-${item.title.toLowerCase()}`}
              >
                <div className={cn(
                  "relative p-1.5 rounded-xl transition-all",
                  isActive && "bg-primary/10"
                )}>
                  <Icon className={cn(
                    "h-5 w-5 transition-all",
                    isActive && "text-primary"
                  )} />
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.title}
                </span>
              </motion.div>
            </Link>
          );
        })}

        <motion.button
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl min-w-[60px] text-muted-foreground"
          whileTap={{ scale: 0.95 }}
          onClick={onMoreClick}
          data-testid="nav-more"
        >
          <div className="p-1.5 rounded-xl">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium">More</span>
        </motion.button>
      </div>
    </nav>
  );
}
