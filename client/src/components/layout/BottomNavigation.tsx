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
  color: string;
}

const navItems: NavItem[] = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard, color: "from-green-500 to-emerald-600" },
  { title: "Cattle", url: "/cattle", icon: Milk, color: "from-blue-500 to-cyan-600" },
  { title: "Production", url: "/production", icon: Package, color: "from-purple-500 to-violet-600" },
  { title: "Billing", url: "/billing", icon: Receipt, color: "from-amber-500 to-orange-600" },
];

interface BottomNavigationProps {
  onMoreClick: () => void;
}

export function BottomNavigation({ onMoreClick }: BottomNavigationProps) {
  const [location] = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-border/50 safe-area-bottom"
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
                whileTap={{ scale: 0.92 }}
                data-testid={`nav-${item.title.toLowerCase()}`}
              >
                <motion.div 
                  className={cn(
                    "relative p-2 rounded-xl transition-all",
                    isActive && `bg-gradient-to-br ${item.color} shadow-lg`
                  )}
                  animate={isActive ? { 
                    scale: [1, 1.05, 1],
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-all",
                    isActive ? "text-white" : "text-muted-foreground"
                  )} />
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 rounded-xl bg-white/20 animate-pulse"
                    />
                  )}
                </motion.div>
                <span className={cn(
                  "text-[10px] font-semibold transition-all",
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
          whileTap={{ scale: 0.92 }}
          onClick={onMoreClick}
          data-testid="nav-more"
        >
          <div className="p-2 rounded-xl">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-semibold">More</span>
        </motion.button>
      </div>
    </nav>
  );
}
