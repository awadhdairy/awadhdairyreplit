import { motion } from "framer-motion";
import { format } from "date-fns";
import { Download, FileSpreadsheet, FileText, Calendar, TrendingUp, IndianRupee, Milk, Users, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const productionData = [
  { date: "01 Jan", morning: 220, evening: 180 },
  { date: "08 Jan", morning: 235, evening: 195 },
  { date: "15 Jan", morning: 248, evening: 205 },
  { date: "22 Jan", morning: 260, evening: 215 },
  { date: "29 Jan", morning: 275, evening: 225 },
];

const revenueData = [
  { month: "Oct", revenue: 185000, expenses: 95000 },
  { month: "Nov", revenue: 195000, expenses: 98000 },
  { month: "Dec", revenue: 220000, expenses: 105000 },
  { month: "Jan", revenue: 245000, expenses: 110000 },
];

const expenseBreakdown = [
  { name: "Feed", value: 45000, color: "hsl(142, 55%, 38%)" },
  { name: "Salary", value: 35000, color: "hsl(280, 65%, 60%)" },
  { name: "Medicine", value: 12000, color: "hsl(199, 89%, 48%)" },
  { name: "Maintenance", value: 8000, color: "hsl(48, 96%, 53%)" },
  { name: "Electricity", value: 8500, color: "hsl(25, 95%, 53%)" },
  { name: "Other", value: 6500, color: "hsl(160, 15%, 50%)" },
];

const cattleData = [
  { status: "Lactating", count: 45 },
  { status: "Pregnant", count: 20 },
  { status: "Dry", count: 15 },
  { status: "Calving", count: 5 },
];

export default function ReportsPage() {
  const { toast } = useToast();

  const handleExport = (format: "pdf" | "excel", report: string) => {
    toast({ title: "Exporting", description: `Generating ${format.toUpperCase()} for ${report}...` });
  };

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
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">This Month</p><p className="text-2xl font-bold text-primary">14,850 L</p><p className="text-xs text-green-600">+8.5% vs last month</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg Daily</p><p className="text-2xl font-bold">478 L</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg Fat %</p><p className="text-2xl font-bold">4.2%</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg SNF %</p><p className="text-2xl font-bold">8.5%</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>30-Day Production Trend</CardTitle><CardDescription>Morning and evening milk production</CardDescription></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={productionData}>
                    <defs>
                      <linearGradient id="morningGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(142, 55%, 38%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(142, 55%, 38%)" stopOpacity={0}/></linearGradient>
                      <linearGradient id="eveningGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/></linearGradient>
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
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Revenue (This Month)</p><p className="text-2xl font-bold text-green-600">₹2,45,000</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Expenses</p><p className="text-2xl font-bold text-red-600">₹1,10,000</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Net Profit</p><p className="text-2xl font-bold text-primary">₹1,35,000</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Profit Margin</p><p className="text-2xl font-bold">55%</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Revenue vs Expenses</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
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
                  <div className="w-1/2 flex flex-col justify-center space-y-2">
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
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Cattle</p><p className="text-2xl font-bold text-primary">85</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Lactating</p><p className="text-2xl font-bold text-green-600">45</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pregnant</p><p className="text-2xl font-bold text-purple-600">20</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Dry</p><p className="text-2xl font-bold text-amber-600">15</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Calving</p><p className="text-2xl font-bold text-pink-600">5</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Cattle Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cattleData} layout="vertical">
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
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Customers</p><p className="text-2xl font-bold text-primary">124</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">118</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Credit</p><p className="text-2xl font-bold text-red-600">₹45,200</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Advance</p><p className="text-2xl font-bold text-green-600">₹12,500</p></CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
