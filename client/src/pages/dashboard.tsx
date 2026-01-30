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
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                  {isPositive ? "+" : ""}{change}% from last week
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
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
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user?.full_name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening at your dairy today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            {user?.role ? roleLabels[user.role] : "Staff"}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Calendar className="h-3 w-3 mr-1.5" />
            {format(new Date(), "dd MMM yyyy")}
          </Badge>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <Link href="/production">
          <Button variant="default" size="sm" data-testid="button-quick-production">
            <Milk className="h-4 w-4 mr-2" />
            Record Production
          </Button>
        </Link>
        <Link href="/deliveries">
          <Button variant="outline" size="sm" data-testid="button-quick-deliveries">
            <Truck className="h-4 w-4 mr-2" />
            View Deliveries
          </Button>
        </Link>
        <Link href="/cattle">
          <Button variant="outline" size="sm" data-testid="button-quick-cattle">
            <Package className="h-4 w-4 mr-2" />
            Manage Cattle
          </Button>
        </Link>
        <Link href="/billing">
          <Button variant="outline" size="sm" data-testid="button-quick-billing">
            <IndianRupee className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title="Today's Production"
            value={isLoading ? "..." : `${stats?.todayProduction?.toFixed(1) || 0} L`}
            change={8.2}
            icon={Milk}
            color="bg-green-500/10 text-green-600 dark:text-green-400"
            link="/production"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Active Cattle"
            value={isLoading ? "..." : (stats?.totalCattle || 0)}
            change={2.5}
            icon={Package}
            color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            link="/cattle"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Customers"
            value={isLoading ? "..." : (stats?.activeCustomers || 0)}
            change={12.3}
            icon={Users}
            color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
            link="/customers"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Monthly Revenue"
            value={isLoading ? "..." : `₹${((stats?.monthlyRevenue || 0) / 1000).toFixed(0)}K`}
            change={15.8}
            icon={IndianRupee}
            color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            link="/billing"
          />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">7-Day Production Trend</CardTitle>
                  <CardDescription>Morning and evening milk production</CardDescription>
                </div>
                <Link href="/production">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
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
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Cattle Composition</CardTitle>
                  <CardDescription>Current herd status breakdown</CardDescription>
                </div>
                <Link href="/cattle">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] flex items-center">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={cattleComposition}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
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
                <div className="w-1/2 space-y-3">
                  {cattleComposition.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today's Deliveries</CardTitle>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Breeding Alerts</CardTitle>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
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
