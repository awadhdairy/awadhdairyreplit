import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, Sun, Moon, Calendar, TrendingUp, Download, Filter, AlertCircle } from "lucide-react";
import { useCattle } from "@/hooks/useData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MilkProduction, SessionType } from "@shared/types";

// Sample production data - only for lactating female cattle (IDs: 1=Lakshmi, 2=Ganga, 5=Saraswati, 8=Parvati)
const sampleProduction: MilkProduction[] = [
  { id: "1", cattle_id: "1", production_date: "2024-01-30", session: "morning", quantity_liters: 12.5, fat_percentage: 4.2, snf_percentage: 8.5, created_at: "2024-01-30" },
  { id: "2", cattle_id: "1", production_date: "2024-01-30", session: "evening", quantity_liters: 10.0, fat_percentage: 4.0, snf_percentage: 8.3, created_at: "2024-01-30" },
  { id: "3", cattle_id: "2", production_date: "2024-01-30", session: "morning", quantity_liters: 14.0, fat_percentage: 4.5, snf_percentage: 8.8, created_at: "2024-01-30" },
  { id: "4", cattle_id: "5", production_date: "2024-01-30", session: "morning", quantity_liters: 11.0, fat_percentage: 4.3, snf_percentage: 8.6, created_at: "2024-01-30" },
  { id: "5", cattle_id: "8", production_date: "2024-01-30", session: "evening", quantity_liters: 9.5, fat_percentage: 4.1, snf_percentage: 8.4, created_at: "2024-01-30" },
];

const chartData = [
  { date: "24 Jan", total: 420 },
  { date: "25 Jan", total: 445 },
  { date: "26 Jan", total: 438 },
  { date: "27 Jan", total: 462 },
  { date: "28 Jan", total: 455 },
  { date: "29 Jan", total: 478 },
  { date: "30 Jan", total: 485 },
];

export default function ProductionPage() {
  const { data: cattleData } = useCattle();
  const [production, setProduction] = useState<MilkProduction[]>(sampleProduction);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedSession, setSelectedSession] = useState<SessionType>("morning");
  const { toast } = useToast();

  // Filter cattle to only show lactating females (intelligent milk production eligibility)
  const eligibleCattle = useMemo(() => {
    if (!cattleData) return [];
    return cattleData.filter(cattle => 
      cattle.gender === 'female' && cattle.lactation_status === 'lactating'
    );
  }, [cattleData]);

  // Create lookup map for cattle display in table
  const cattleLookup = useMemo(() => {
    if (!cattleData) return new Map();
    return new Map(cattleData.map(c => [c.id, c]));
  }, [cattleData]);

  const [formData, setFormData] = useState({
    cattle_id: "",
    quantity_liters: "",
    fat_percentage: "",
    snf_percentage: "",
    quality_notes: "",
  });

  const todayProduction = production.filter(
    (p) => p.production_date === selectedDate
  );

  const morningTotal = todayProduction
    .filter((p) => p.session === "morning")
    .reduce((sum, p) => sum + p.quantity_liters, 0);

  const eveningTotal = todayProduction
    .filter((p) => p.session === "evening")
    .reduce((sum, p) => sum + p.quantity_liters, 0);

  const totalToday = morningTotal + eveningTotal;

  const avgFat =
    todayProduction.length > 0
      ? todayProduction.reduce((sum, p) => sum + (p.fat_percentage || 0), 0) /
        todayProduction.length
      : 0;

  const columns: Column<MilkProduction>[] = [
    {
      key: "cattle_id",
      header: "Cattle",
      render: (item) => {
        const cattle = cattleLookup.get(item.cattle_id);
        return (
          <div>
            <span className="font-mono text-primary">{cattle?.tag_number || 'Unknown'}</span>
            <span className="text-muted-foreground ml-2">{cattle?.name || ''}</span>
          </div>
        );
      },
    },
    {
      key: "session",
      header: "Session",
      render: (item) => (
        <Badge variant="outline" className="gap-1">
          {item.session === "morning" ? (
            <Sun className="h-3 w-3 text-amber-500" />
          ) : (
            <Moon className="h-3 w-3 text-indigo-500" />
          )}
          {item.session === "morning" ? "Morning" : "Evening"}
        </Badge>
      ),
    },
    {
      key: "quantity_liters",
      header: "Quantity",
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-primary">{item.quantity_liters} L</span>
      ),
    },
    {
      key: "fat_percentage",
      header: "Fat %",
      render: (item) => item.fat_percentage?.toFixed(1) || "-",
    },
    {
      key: "snf_percentage",
      header: "SNF %",
      render: (item) => item.snf_percentage?.toFixed(1) || "-",
    },
  ];

  const handleSubmit = () => {
    if (!formData.cattle_id || !formData.quantity_liters) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate cattle is eligible (female + lactating)
    const isEligible = eligibleCattle.some(c => c.id === formData.cattle_id);
    if (!isEligible) {
      toast({
        title: "Invalid Cattle",
        description: "Only lactating female cattle can produce milk",
        variant: "destructive",
      });
      return;
    }

    const newRecord: MilkProduction = {
      id: Date.now().toString(),
      cattle_id: formData.cattle_id,
      production_date: selectedDate,
      session: selectedSession,
      quantity_liters: parseFloat(formData.quantity_liters),
      fat_percentage: formData.fat_percentage ? parseFloat(formData.fat_percentage) : undefined,
      snf_percentage: formData.snf_percentage ? parseFloat(formData.snf_percentage) : undefined,
      quality_notes: formData.quality_notes || undefined,
      created_at: new Date().toISOString(),
    };

    setProduction((prev) => [...prev, newRecord]);
    toast({
      title: "Production Recorded",
      description: `${formData.quantity_liters}L recorded for ${selectedSession} session`,
    });

    setFormData({
      cattle_id: "",
      quantity_liters: "",
      fat_percentage: "",
      snf_percentage: "",
      quality_notes: "",
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Milk Production"
        description="Record and track daily milk production"
        action={{
          label: "Record Production",
          onClick: () => setIsDialogOpen(true),
        }}
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Date and Session Selector */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
            data-testid="input-date"
          />
        </div>
        <Tabs value={selectedSession} onValueChange={(v) => setSelectedSession(v as SessionType)}>
          <TabsList>
            <TabsTrigger value="morning" className="gap-2" data-testid="tab-morning">
              <Sun className="h-4 w-4" />
              Morning
            </TabsTrigger>
            <TabsTrigger value="evening" className="gap-2" data-testid="tab-evening">
              <Moon className="h-4 w-4" />
              Evening
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="hover-elevate cursor-pointer">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Today's Total</p>
            <p className="text-2xl font-bold text-primary">{totalToday.toFixed(1)} L</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-muted-foreground">Morning</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{morningTotal.toFixed(1)} L</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-500" />
              <p className="text-sm text-muted-foreground">Evening</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">{eveningTotal.toFixed(1)} L</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Avg Fat %</p>
            <p className="text-2xl font-bold text-green-600">{avgFat.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Production Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">7-Day Production Trend</CardTitle>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                +8.2% from last week
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 55%, 38%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 55%, 38%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`${value} L`, "Total"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(142, 55%, 38%)"
                    fill="url(#productionGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Production Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DataTable
          data={todayProduction.filter((p) => p.session === selectedSession)}
          columns={columns}
          searchKey="cattle_id"
          searchPlaceholder="Search by cattle..."
          emptyMessage={`No ${selectedSession} production records for ${format(new Date(selectedDate), "dd MMM yyyy")}`}
        />
      </motion.div>

      {/* Record Production Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Milk Production</DialogTitle>
            <DialogDescription>
              Record milk production for {selectedSession} session on{" "}
              {format(new Date(selectedDate), "dd MMM yyyy")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Info banner explaining eligibility */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border text-sm" data-testid="info-eligible-cattle">
              <AlertCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <p className="text-muted-foreground">
                Only <span className="font-medium text-foreground">lactating female</span> cattle can produce milk. 
                {eligibleCattle.length > 0 
                  ? ` ${eligibleCattle.length} eligible cattle available.`
                  : ' No eligible cattle found.'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cattle">Cattle *</Label>
              {eligibleCattle.length > 0 ? (
                <Select
                  value={formData.cattle_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cattle_id: value })
                  }
                >
                  <SelectTrigger data-testid="select-cattle">
                    <SelectValue placeholder="Select lactating cattle" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleCattle.map((cattle) => (
                      <SelectItem key={cattle.id} value={cattle.id} data-testid={`option-cattle-${cattle.id}`}>
                        {cattle.tag_number} - {cattle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground text-sm" data-testid="text-no-eligible-cattle">
                  No lactating female cattle available for milk production
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Liters) *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                placeholder="e.g., 12.5"
                value={formData.quantity_liters}
                onChange={(e) =>
                  setFormData({ ...formData, quantity_liters: e.target.value })
                }
                data-testid="input-quantity"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fat">Fat %</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 4.2"
                  value={formData.fat_percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, fat_percentage: e.target.value })
                  }
                  data-testid="input-fat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snf">SNF %</Label>
                <Input
                  id="snf"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 8.5"
                  value={formData.snf_percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, snf_percentage: e.target.value })
                  }
                  data-testid="input-snf"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Quality Notes</Label>
              <Input
                id="notes"
                placeholder="Any observations..."
                value={formData.quality_notes}
                onChange={(e) =>
                  setFormData({ ...formData, quality_notes: e.target.value })
                }
                data-testid="input-quality-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={eligibleCattle.length === 0}
              data-testid="button-submit-production"
            >
              Record Production
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
