import { Bell, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@assets/awadh_dairy_bg_logo_1769831028374.png";

export function MobileHeader() {
  return (
    <header 
      className="sticky top-0 z-40 flex md:hidden h-14 items-center justify-between gap-2 border-b border-border/50 glass-strong px-4 safe-area-top"
      data-testid="mobile-header"
    >
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <img src={logo} alt="Awadh Dairy" className="h-9 w-9 rounded-xl shadow-md" />
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-foreground leading-tight flex items-center gap-1">
            Awadh Dairy
            <Sparkles className="h-3 w-3 text-amber-500" />
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">Farm ERP System</span>
        </div>
      </motion.div>

      <motion.div 
        className="flex items-center gap-1"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Button variant="ghost" size="icon" data-testid="button-mobile-search">
          <Search className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" data-testid="button-mobile-notifications">
              <Bell className="h-4 w-4" />
              <Badge 
                className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-gradient-to-r from-red-500 to-rose-600 border-0 text-white animate-pulse"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 glass-card">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <span className="font-medium text-sm">Low Stock Alert</span>
              <span className="text-xs text-muted-foreground">Green fodder stock is below minimum</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
              <span className="font-medium text-sm">Vaccination Due</span>
              <span className="text-xs text-muted-foreground">3 cattle have vaccinations due</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-primary text-sm font-medium cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </motion.div>
    </header>
  );
}
