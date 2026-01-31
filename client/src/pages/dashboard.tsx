import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import {
  Milk,
  Users,
  IndianRupee,
  Truck,
  TrendingUp,
  TrendingDown,
  Heart,
  Baby,
  AlertTriangle,
  Calendar,
  Package,
  ArrowRight,
  CircleDot,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useDashboardStats, useCattle, useProduction, useDeliveries, 
  useExpenses, useInventory, useEquipment, useHealthRecords, 
  useEmployees, useInvoices, useVendorPayments, useCustomers 
} from "@/hooks/useData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Link } from "wouter";
import type { ExpenseCategory } from "@shared/types";
import { GradientCard } from "@/components/ui/gradient-card";
import { AnimatedNumber } from "@/components/ui/animated-counter";
import { GlowButton } from "@/components/ui/glow-button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const categoryColors: Record<ExpenseCategory, string> = {
  feed: "hsl(142, 55%, 38%)",
  medicine: "hsl(199, 89%, 48%)",
  salary: "hsl(280, 65%, 60%)",
  transport: "hsl(48, 96%, 53%)",
  electricity: "hsl(25, 95%, 53%)",
  maintenance: "hsl(340, 65%, 55%)",
  misc: "hsl(160, 15%, 50%)",
};

const categoryLabels: Record<ExpenseCategory, string> = {
  feed: "Feed",
  medicine: "Medicine",
  salary: "Salary",
  transport: "Transport",
  electricity: "Electricity",
  maintenance: "Maintenance",
  misc: "Other",
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  link?: string;
}

function StatCard({ title, value, change, icon: Icon, color, link }: StatCardProps) {
  const isPositive = change && change > 0;

  const content = (
    <Card className="hover-elevate cursor-pointer transition-all duration-200">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs md:text-sm text-muted-foreground truncate">{title}</span>
            <span className="text-xl md:text-2xl font-bold tracking-tight">{value}</span>
            {change !== undefined && (
              <div className="hidden md:flex items-center gap-1 mt-1">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {isPositive ? "+" : ""}{change}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-2 md:p-3 rounded-xl shrink-0 ${color}`}>
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  
  // Fetch real data for charts
  const { data: cattle = [] } = useCattle();
  const { data: production = [] } = useProduction();
  const { data: deliveries = [] } = useDeliveries();
  const { data: expenses = [] } = useExpenses();
  const { data: inventory = [] } = useInventory();
  const { data: equipment = [] } = useEquipment();
  const { data: healthRecords = [] } = useHealthRecords();
  const { data: employees = [] } = useEmployees();
  const { data: invoices = [] } = useInvoices();
  const { data: vendorPayments = [] } = useVendorPayments();
  const { data: customers = [] } = useCustomers();

  // Calculate real 7-day production data
  const productionData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        day: days[date.getDay()],
      };
    });

    return last7Days.map(({ date, day }) => {
      const dayProduction = production.filter(p => p.production_date === date);
      const morning = dayProduction.filter(p => p.session === 'morning').reduce((sum, p) => sum + (p.quantity_liters || 0), 0);
      const evening = dayProduction.filter(p => p.session === 'evening').reduce((sum, p) => sum + (p.quantity_liters || 0), 0);
      return { day, morning: Math.round(morning), evening: Math.round(evening) };
    });
  }, [production]);

  // Calculate real cattle composition
  const cattleComposition = useMemo(() => {
    const activeCattle = cattle.filter(c => c.status === 'active');
    const lactating = activeCattle.filter(c => c.lactation_status === 'lactating').length;
    const pregnant = activeCattle.filter(c => c.lactation_status === 'pregnant').length;
    const dry = activeCattle.filter(c => c.lactation_status === 'dry').length;
    const calving = activeCattle.filter(c => c.lactation_status === 'calving').length;
    
    return [
      { name: "Lactating", value: lactating, color: "hsl(142, 55%, 38%)" },
      { name: "Pregnant", value: pregnant, color: "hsl(280, 65%, 60%)" },
      { name: "Dry", value: dry, color: "hsl(48, 96%, 53%)" },
      { name: "Calving", value: calving, color: "hsl(340, 65%, 55%)" },
    ].filter(c => c.value > 0);
  }, [cattle]);

  // Calculate real expense breakdown from ALL paid sources
  const expenseBreakdown = useMemo(() => {
    const categoryTotals: Record<ExpenseCategory, number> = {
      feed: 0, medicine: 0, salary: 0, transport: 0, electricity: 0, maintenance: 0, misc: 0
    };

    // Manual expenses (already paid)
    expenses.forEach(e => {
      categoryTotals[e.category] += e.amount;
    });

    // Health records (veterinary costs - paid)
    healthRecords.forEach(record => {
      if (record.cost && record.cost > 0) {
        categoryTotals.medicine += record.cost;
      }
    });

    // Inventory purchases (paid)
    inventory.forEach(item => {
      if (item.unit_price && item.quantity && item.unit_price > 0) {
        const total = item.unit_price * item.quantity;
        if (item.category === 'feed') categoryTotals.feed += total;
        else if (item.category === 'medicine') categoryTotals.medicine += total;
        else if (item.category === 'equipment') categoryTotals.maintenance += total;
        else categoryTotals.misc += total;
      }
    });

    // Equipment purchases (paid)
    equipment.forEach(eq => {
      if (eq.purchase_cost && eq.purchase_cost > 0) {
        categoryTotals.maintenance += eq.purchase_cost;
      }
    });

    // Vendor payments (actually paid to vendors)
    vendorPayments.forEach(payment => {
      if (payment.amount && payment.amount > 0) {
        categoryTotals.misc += payment.amount;
      }
    });

    // Employee salaries (paid monthly)
    employees.filter(e => e.is_active && e.salary && e.salary > 0).forEach(emp => {
      categoryTotals.salary += emp.salary!;
    });

    return Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: categoryLabels[key as ExpenseCategory],
        value: Math.round(value),
        color: categoryColors[key as ExpenseCategory],
      }));
  }, [expenses, healthRecords, inventory, equipment, vendorPayments, employees]);

  // Calculate real delivery stats
  const deliveryStats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayDeliveries = deliveries.filter(d => d.delivery_date === today);
    
    return [
      { status: "Delivered", count: todayDeliveries.filter(d => d.status === 'delivered').length, color: "hsl(142, 76%, 36%)" },
      { status: "Pending", count: todayDeliveries.filter(d => d.status === 'pending').length, color: "hsl(38, 92%, 50%)" },
      { status: "Missed", count: todayDeliveries.filter(d => d.status === 'missed').length, color: "hsl(0, 72%, 51%)" },
    ];
  }, [deliveries]);

  // Calculate total expenses for display
  const totalExpenses = useMemo(() => {
    return expenseBreakdown.reduce((sum, e) => sum + e.value, 0);
  }, [expenseBreakdown]);

  // Calculate total revenue from paid invoices
  const totalRevenue = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  }, [invoices]);

  // Calculate outstanding amount from customers
  const outstandingAmount = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.credit_balance || 0), 0);
  }, [customers]);

  // Calculate top customers by revenue (from invoices)
  const topCustomers = useMemo(() => {
    const customerRevenue: Record<string, { name: string; revenue: number; invoiceCount: number }> = {};
    
    invoices.forEach(inv => {
      const customer = customers.find(c => c.id === inv.customer_id);
      const customerName = customer?.name || 'Unknown';
      const customerId = inv.customer_id || 'unknown';
      
      if (!customerRevenue[customerId]) {
        customerRevenue[customerId] = { name: customerName, revenue: 0, invoiceCount: 0 };
      }
      customerRevenue[customerId].revenue += inv.total_amount || 0;
      customerRevenue[customerId].invoiceCount += 1;
    });
    
    return Object.values(customerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((c, i) => ({
        ...c,
        revenue: Math.round(c.revenue),
        color: ["hsl(142, 55%, 38%)", "hsl(199, 89%, 48%)", "hsl(280, 65%, 60%)", "hsl(48, 96%, 53%)", "hsl(340, 65%, 55%)"][i],
      }));
  }, [invoices, customers]);

  // Calculate monthly revenue trend (last 6 months)
  const monthlyRevenueData = useMemo(() => {
    const months: { month: string; billed: number; collected: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthName = format(date, 'MMM');
      
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return invDate >= monthStart && invDate <= monthEnd;
      });
      
      months.push({
        month: monthName,
        billed: Math.round(monthInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)),
        collected: Math.round(monthInvoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0)),
      });
    }
    
    return months;
  }, [invoices]);

  // Financial summary
  const financialSummary = useMemo(() => {
    const totalBilled = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
    const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;
    
    return {
      totalBilled: Math.round(totalBilled),
      totalCollected: Math.round(totalCollected),
      outstanding: Math.round(totalBilled - totalCollected),
      collectionRate: Math.round(collectionRate),
    };
  }, [invoices]);

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    manager: "Manager",
    accountant: "Accountant",
    delivery_staff: "Delivery Staff",
    farm_worker: "Farm Worker",
    vet_staff: "Vet Staff",
    auditor: "Auditor",
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 particle-bg">
      {/* Welcome Section - Animated gradient header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-4 md:p-6 gradient-animated text-white"
      >
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <motion.h1 
                className="text-xl md:text-3xl font-bold tracking-tight flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="h-5 w-5 md:h-7 md:w-7 text-yellow-300" />
                Welcome, {user?.full_name?.split(" ")[0] || "User"}!
              </motion.h1>
              <motion.p 
                className="text-sm md:text-base text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Here's what's happening at your dairy farm today
              </motion.p>
            </div>
            <motion.div 
              className="hidden md:flex flex-col items-end gap-1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                {user?.role ? roleLabels[user.role] : "Staff"}
              </Badge>
              <span className="text-xs text-white/70 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(), "EEEE, dd MMM yyyy")}
              </span>
            </motion.div>
          </div>
          <div className="flex items-center gap-2 flex-wrap md:hidden">
            <Badge className="bg-white/20 text-white border-white/30 px-2 py-0.5 text-xs">
              {user?.role ? roleLabels[user.role] : "Staff"}
            </Badge>
            <Badge className="bg-white/10 text-white/90 border-white/20 px-2 py-0.5 text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(), "dd MMM yyyy")}
            </Badge>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      </motion.div>

      {/* Quick Actions - Horizontal scroll on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap"
      >
        <Link href="/production">
          <GlowButton icon={Milk} size="sm" data-testid="button-quick-production">
            <span className="hidden sm:inline">Record</span> Production
          </GlowButton>
        </Link>
        <Link href="/deliveries">
          <Button variant="outline" size="sm" className="whitespace-nowrap hover-glow" data-testid="button-quick-deliveries">
            <Truck className="h-4 w-4 mr-1.5" />
            Deliveries
          </Button>
        </Link>
        <Link href="/cattle">
          <Button variant="outline" size="sm" className="whitespace-nowrap hover-glow" data-testid="button-quick-cattle">
            <Package className="h-4 w-4 mr-1.5" />
            Cattle
          </Button>
        </Link>
        <Link href="/billing">
          <Button variant="outline" size="sm" className="whitespace-nowrap hover-glow" data-testid="button-quick-billing">
            <IndianRupee className="h-4 w-4 mr-1.5" />
            Invoice
          </Button>
        </Link>
      </motion.div>

      {/* Stats Cards - Gradient cards with animations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Link href="/production">
          <GradientCard
            title="Today's Production"
            value={isLoading ? "..." : `${stats?.todayProduction?.toFixed(1) || 0} L`}
            icon={Milk}
            variant="green"
            trend={{ value: 8.2, label: "vs yesterday" }}
            delay={0.1}
          />
        </Link>
        <Link href="/cattle">
          <GradientCard
            title="Active Cattle"
            value={isLoading ? "..." : String(stats?.totalCattle || 0)}
            icon={Package}
            variant="blue"
            trend={{ value: 2.5, label: "this week" }}
            delay={0.15}
          />
        </Link>
        <Link href="/customers">
          <GradientCard
            title="Total Customers"
            value={isLoading ? "..." : String(stats?.activeCustomers || 0)}
            icon={Users}
            variant="purple"
            trend={{ value: 12.3, label: "this month" }}
            delay={0.2}
          />
        </Link>
        <Link href="/billing">
          <GradientCard
            title="Monthly Revenue"
            value={isLoading ? "..." : `₹${((stats?.monthlyRevenue || 0) / 1000).toFixed(0)}K`}
            icon={IndianRupee}
            variant="amber"
            trend={{ value: 15.8, label: "growth" }}
            delay={0.25}
          />
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Production Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-card modern-card overflow-visible">
            <CardHeader className="p-4 md:pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base md:text-lg truncate flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Production Trend
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm hidden sm:block">Morning and evening milk output</CardDescription>
                </div>
                <Link href="/production">
                  <Button variant="ghost" size="sm" className="shrink-0 h-8 px-2 md:px-3 hover-glow">
                    <span className="hidden sm:inline">View All</span>
                    <ArrowRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[200px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productionData}>
                    <defs>
                      <linearGradient id="morningGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 55%, 38%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142, 55%, 38%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="eveningGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="morning"
                      stroke="hsl(142, 55%, 38%)"
                      fill="url(#morningGradient)"
                      strokeWidth={2}
                      name="Morning"
                    />
                    <Area
                      type="monotone"
                      dataKey="evening"
                      stroke="hsl(199, 89%, 48%)"
                      fill="url(#eveningGradient)"
                      strokeWidth={2}
                      name="Evening"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cattle Composition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="glass-card modern-card overflow-visible">
            <CardHeader className="p-4 md:pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base md:text-lg truncate flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Cattle Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm hidden sm:block">Current herd composition</CardDescription>
                </div>
                <Link href="/cattle">
                  <Button variant="ghost" size="sm" className="shrink-0 h-8 px-2 md:px-3 hover-glow">
                    <span className="hidden sm:inline">View All</span>
                    <ArrowRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[200px] md:h-[280px] flex items-center">
                <div className="w-2/5 md:w-1/2">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={cattleComposition}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {cattleComposition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-3/5 md:w-1/2 space-y-2 md:space-y-3">
                  {cattleComposition.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div
                          className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs md:text-sm">{item.name}</span>
                      </div>
                      <span className="text-xs md:text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Financial Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Card className="glass-card modern-card overflow-visible">
            <CardHeader className="p-4 md:pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base md:text-lg truncate flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Revenue Overview
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm hidden sm:block">Billed vs Collected (Last 6 months)</CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 text-xs">
                    {financialSummary.collectionRate}% collected
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[200px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData}>
                    <defs>
                      <linearGradient id="billedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(142, 55%, 38%)" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(142, 55%, 38%)" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                    />
                    <Legend />
                    <Bar dataKey="billed" name="Billed" fill="url(#billedGradient)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="collected" name="Collected" fill="url(#collectedGradient)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="glass-card modern-card overflow-visible">
            <CardHeader className="p-4 md:pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base md:text-lg truncate flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    Expense Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm hidden sm:block">Where your money goes</CardDescription>
                </div>
                <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 text-xs shrink-0">
                  ₹{totalExpenses >= 1000 ? `${(totalExpenses/1000).toFixed(0)}K` : totalExpenses} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[200px] md:h-[280px] flex items-center">
                <div className="w-2/5 md:w-1/2">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`expense-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-3/5 md:w-1/2 space-y-2 md:space-y-2.5 max-h-[200px] overflow-y-auto">
                  {expenseBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div
                          className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs md:text-sm truncate">{item.name}</span>
                      </div>
                      <span className="text-xs md:text-sm font-medium shrink-0">₹{item.value >= 1000 ? `${(item.value/1000).toFixed(1)}K` : item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Customers Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <Card className="glass-card modern-card overflow-visible">
          <CardHeader className="p-4 md:pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-base md:text-lg truncate flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Top Customers
                </CardTitle>
                <CardDescription className="text-xs md:text-sm hidden sm:block">Highest revenue contributors</CardDescription>
              </div>
              <Link href="/customers">
                <Button variant="ghost" size="sm" className="shrink-0 h-8 px-2 md:px-3">
                  <span className="hidden sm:inline">View All</span>
                  <ArrowRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-[200px] md:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} tickFormatter={(v) => v.length > 12 ? `${v.slice(0, 12)}...` : v} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string, props: any) => [`₹${value.toLocaleString('en-IN')} (${props.payload.invoiceCount} invoices)`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {topCustomers.map((entry, index) => (
                      <Cell key={`customer-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="glass-card modern-card overflow-visible">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-500" />
                Today's Deliveries
              </CardTitle>
              <CardDescription>Delivery status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveryStats.map((item) => (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CircleDot
                          className="h-3 w-3"
                          style={{ color: item.color }}
                        />
                        <span>{item.status}</span>
                      </div>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <Progress
                      value={(item.count / 60) * 100}
                      className="h-2"
                      style={{
                        ["--progress-background" as any]: item.color,
                      }}
                    />
                  </div>
                ))}
              </div>
              <Link href="/deliveries">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Deliveries
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Breeding Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="glass-card modern-card overflow-visible">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                Breeding Alerts
              </CardTitle>
              <CardDescription>Upcoming events & reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-pink-500/10">
                  <Heart className="h-4 w-4 text-pink-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Heat Detection</p>
                    <p className="text-xs text-muted-foreground">
                      2 cattle showing heat signs today
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">2</Badge>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10">
                  <Baby className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Expected Calvings</p>
                    <p className="text-xs text-muted-foreground">
                      1 calving expected this week
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">1</Badge>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Vaccinations Due</p>
                    <p className="text-xs text-muted-foreground">
                      3 cattle need vaccination
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">3</Badge>
                </div>
              </div>
              <Link href="/breeding">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Breeding Records
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="glass-card modern-card overflow-visible">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">Morning production recorded</p>
                    <p className="text-xs text-muted-foreground">245L total • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">Invoice #INV-2024-089 generated</p>
                    <p className="text-xs text-muted-foreground">₹12,500 • 3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">New customer added</p>
                    <p className="text-xs text-muted-foreground">Sharma Family • 5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">Feed stock updated</p>
                    <p className="text-xs text-muted-foreground">+500kg Green Fodder • Yesterday</p>
                  </div>
                </div>
              </div>
              <Link href="/audit-logs">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Activity
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
