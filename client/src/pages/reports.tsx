import { useMemo } from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Download, FileSpreadsheet, FileText, Milk, Users, Package, IndianRupee, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useProduction, useExpenses, useInvoices, useCattle, useCustomers } from "@/hooks/useData";

export default function ReportsPage() {
  const { toast } = useToast();
  const { data: production = [], isLoading: loadingProduction } = useProduction();
  const { data: expenses = [], isLoading: loadingExpenses } = useExpenses();
  const { data: invoices = [], isLoading: loadingInvoices } = useInvoices();
  const { data: cattle = [], isLoading: loadingCattle } = useCattle();
  const { data: customers = [], isLoading: loadingCustomers } = useCustomers();

  const isLoading = loadingProduction || loadingExpenses || loadingInvoices || loadingCattle || loadingCustomers;

  // Real Production Data (Last 30 Days)
  const productionTrend = useMemo(() => {
    const days = 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dispDate = format(date, 'dd MMM');

      const dayProd = production.filter(p => p.production_date === dateStr);
      const morning = dayProd.filter(p => p.session === 'morning').reduce((sum, p) => sum + (p.quantity_liters || 0), 0);
      const evening = dayProd.filter(p => p.session === 'evening').reduce((sum, p) => sum + (p.quantity_liters || 0), 0);

      data.push({ date: dispDate, morning, evening });
    }
    return data;
  }, [production]);

  const productionStats = useMemo(() => {
    const thisMonth = format(new Date(), 'yyyy-MM');
    const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM');

    const currentMonthProd = production.filter(p => p.production_date.startsWith(thisMonth)).reduce((sum, p) => sum + (p.quantity_liters || 0), 0);
    const lastMonthProd = production.filter(p => p.production_date.startsWith(lastMonth)).reduce((sum, p) => sum + (p.quantity_liters || 0), 0);

    const avgDaily = currentMonthProd / (new Date().getDate() || 1);

    // Fake fat/snf avg as specific readings aren't easily averaged without more complex logic or data
    const avgFat = production.reduce((sum, p) => sum + (p.fat_percentage || 0), 0) / (production.length || 1);
    const avgSnf = production.reduce((sum, p) => sum + (p.snf_percentage || 0), 0) / (production.length || 1);

    return { total: currentMonthProd, lastTotal: lastMonthProd, avgDaily, avgFat, avgSnf };
  }, [production]);

  // Real Financial Data (Last 6 Months)
  const financialTrend = useMemo(() => {
    const months = 6;
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthLabel = format(date, 'MMM');

      const monthRevenue = invoices
        .filter(inv => {
          const d = new Date(inv.created_at);
          return d >= monthStart && d <= monthEnd && inv.status !== 'cancelled';
        })
        .reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);

      const monthExpenses = expenses
        .filter(exp => {
          const d = new Date(exp.date);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);

      data.push({ month: monthLabel, revenue: monthRevenue, expenses: monthExpenses });
    }
    return data;
  }, [invoices, expenses]);

  const expenseBreakdown = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const colors = ["hsl(142, 55%, 38%)", "hsl(280, 65%, 60%)", "hsl(199, 89%, 48%)", "hsl(48, 96%, 53%)", "hsl(25, 95%, 53%)", "hsl(160, 15%, 50%)"];

    return Object.entries(categoryTotals).map(([name, value], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[i % colors.length]
    }));
  }, [expenses]);

  const financialStats = useMemo(() => {
    const thisMonthStart = startOfMonth(new Date());
    const thisMonthRevenue = invoices
      .filter(inv => new Date(inv.created_at) >= thisMonthStart && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);

    const thisMonthExpenses = expenses
      .filter(exp => new Date(exp.date) >= thisMonthStart)
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const netProfit = thisMonthRevenue - thisMonthExpenses;
    const margin = thisMonthRevenue > 0 ? (netProfit / thisMonthRevenue) * 100 : 0;

    return { revenue: thisMonthRevenue, expenses: thisMonthExpenses, profit: netProfit, margin };
  }, [invoices, expenses]);

  // Real Cattle Data
  const cattleStats = useMemo(() => {
    const active = cattle.filter(c => c.status === 'active');
    const counts = { lactating: 0, pregnant: 0, dry: 0, calving: 0 };
    active.forEach(c => {
      if (counts[c.lactation_status as keyof typeof counts] !== undefined) {
        counts[c.lactation_status as keyof typeof counts]++;
      }
    });

    return [
      { status: "Lactating", count: counts.lactating },
      { status: "Pregnant", count: counts.pregnant },
      { status: "Dry", count: counts.dry },
      { status: "Calving", count: counts.calving },
    ];
  }, [cattle]);

  // Real Customer Stats
  const customerStats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.is_active).length;
    const credit = customers.reduce((sum, c) => sum + (c.credit_balance || 0), 0);
    const advance = 0; // Not tracked separately currently, usually negative credit?
    return { total, active, credit, advance };
  }, [customers]);

  const handleExport = (format: "pdf" | "excel", report: string) => {
    toast({ title: "Exporting", description: `Generating ${format.toUpperCase()} for ${report}...` });
    // In a real app, integrate jsPDF or xlsx here using the real data above
  };

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Reports & Analytics" description="View detailed reports and export data">
        <Button variant="outline" size="sm" onClick={() => handleExport("excel", "Full Backup")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export All Data
        </Button>
      </PageHeader>

      <Tabs defaultValue="production" className="space-y-6">
        <TabsList>
          <TabsTrigger value="production" className="gap-2" data-testid="tab-production"><Milk className="h-4 w-4" />Production</TabsTrigger>
          <TabsTrigger value="financial" className="gap-2" data-testid="tab-financial"><IndianRupee className="h-4 w-4" />Financial</TabsTrigger>
          <TabsTrigger value="cattle" className="gap-2" data-testid="tab-cattle"><Package className="h-4 w-4" />Cattle</TabsTrigger>
          <TabsTrigger value="customers" className="gap-2" data-testid="tab-customers"><Users className="h-4 w-4" />Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("pdf", "Production Report")}><FileText className="h-4 w-4 mr-2" />PDF</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("excel", "Production Report")}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">This Month</p><p className="text-2xl font-bold text-primary">{Math.round(productionStats.total)} L</p><p className="text-xs text-green-600">{productionStats.lastTotal > 0 ? (((productionStats.total - productionStats.lastTotal) / productionStats.lastTotal) * 100).toFixed(1) : 0}% vs last month</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg Daily</p><p className="text-2xl font-bold">{Math.round(productionStats.avgDaily)} L</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg Fat %</p><p className="text-2xl font-bold">{productionStats.avgFat.toFixed(1)}%</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg SNF %</p><p className="text-2xl font-bold">{productionStats.avgSnf.toFixed(1)}%</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>30-Day Production Trend</CardTitle><CardDescription>Morning and evening milk production</CardDescription></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productionTrend}>
                    <defs>
                      <linearGradient id="morningGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(142, 55%, 38%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(142, 55%, 38%)" stopOpacity={0} /></linearGradient>
                      <linearGradient id="eveningGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                    <Area type="monotone" dataKey="morning" stroke="hsl(142, 55%, 38%)" fill="url(#morningGrad)" strokeWidth={2} name="Morning" />
                    <Area type="monotone" dataKey="evening" stroke="hsl(199, 89%, 48%)" fill="url(#eveningGrad)" strokeWidth={2} name="Evening" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("pdf", "Financial Report")}><FileText className="h-4 w-4 mr-2" />PDF</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("excel", "Financial Report")}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Revenue (This Month)</p><p className="text-2xl font-bold text-green-600">₹{financialStats.revenue.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Expenses</p><p className="text-2xl font-bold text-red-600">₹{financialStats.expenses.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Net Profit</p><p className="text-2xl font-bold text-primary">₹{financialStats.profit.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Profit Margin</p><p className="text-2xl font-bold">{financialStats.margin.toFixed(1)}%</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Revenue vs Expenses (Last 6 Months)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                      <Legend />
                      <Bar dataKey="revenue" fill="hsl(142, 55%, 38%)" name="Revenue" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="hsl(0, 72%, 51%)" name="Expenses" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[280px] flex">
                  <div className="w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">{expenseBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} /></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 flex flex-col justify-center space-y-2 overflow-y-auto">
                    {expenseBreakdown.map((item) => <div key={item.name} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} /><span>{item.name}</span></div><span className="font-medium">₹{item.value.toLocaleString("en-IN")}</span></div>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cattle" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("excel", "Cattle Report")}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Cattle</p><p className="text-2xl font-bold text-primary">{cattle.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Lactating</p><p className="text-2xl font-bold text-green-600">{cattleStats.find(s => s.status === 'Lactating')?.count || 0}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pregnant</p><p className="text-2xl font-bold text-purple-600">{cattleStats.find(s => s.status === 'Pregnant')?.count || 0}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Dry</p><p className="text-2xl font-bold text-amber-600">{cattleStats.find(s => s.status === 'Dry')?.count || 0}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Calving</p><p className="text-2xl font-bold text-pink-600">{cattleStats.find(s => s.status === 'Calving')?.count || 0}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Cattle Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cattleStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="status" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="count" fill="hsl(142, 55%, 38%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("excel", "Customer Report")}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Customers</p><p className="text-2xl font-bold text-primary">{customerStats.total}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{customerStats.active}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Credit</p><p className="text-2xl font-bold text-red-600">₹{customerStats.credit.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Advance</p><p className="text-2xl font-bold text-green-600">₹{customerStats.advance.toLocaleString()}</p></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
