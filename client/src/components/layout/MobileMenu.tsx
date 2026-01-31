import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Truck,
  DollarSign,
  Heart,
  Baby,
  Wheat,
  Wrench,
  UserCog,
  Route,
  FileText,
  Settings,
  LogOut,
  ShoppingCart,
  History,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import logo from "@assets/awadh_dairy_bg_logo_1769831028374.png";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: NavItem[] = [
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Deliveries", url: "/deliveries", icon: Truck },
  { title: "Procurement", url: "/procurement", icon: ShoppingCart },
  { title: "Health Records", url: "/health", icon: Heart },
  { title: "Breeding", url: "/breeding", icon: Baby },
  { title: "Feed & Inventory", url: "/inventory", icon: Wheat },
  { title: "Equipment", url: "/equipment", icon: Wrench },
  { title: "Routes", url: "/routes", icon: Route },
  { title: "Expenses", url: "/expenses", icon: DollarSign },
  { title: "Employees", url: "/employees", icon: UserCog },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Audit Logs", url: "/audit-logs", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-[85%] max-w-sm bg-background shadow-2xl md:hidden"
            data-testid="mobile-menu"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="Awadh Dairy" className="h-10 w-10 rounded-lg" />
                  <div>
                    <h2 className="font-semibold text-foreground">Awadh Dairy</h2>
                    <p className="text-xs text-muted-foreground">Farm Management</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  data-testid="button-close-menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{user?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace("_", " ") || "Staff"}</p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location === item.url;
                    const Icon = item.icon;

                    return (
                      <Link key={item.url} href={item.url} onClick={onClose}>
                        <motion.div
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                            isActive 
                              ? "bg-primary/10 text-primary" 
                              : "text-foreground hover:bg-muted"
                          )}
                          whileTap={{ scale: 0.98 }}
                          data-testid={`menu-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border safe-area-bottom">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
