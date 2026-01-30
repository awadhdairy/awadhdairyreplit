import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { 
  Plus, ShoppingCart, Sun, Moon, Download, Edit, Trash2, User, Users, 
  CreditCard, BarChart3, Phone, MapPin, Banknote, Building2, CheckCircle2,
  AlertCircle, TrendingUp, Scale, Droplets, IndianRupee, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { 
  useVendors, useAddVendor, useUpdateVendor, useDeleteVendor,
  useVendorPayments, useAddVendorPayment, useAddBulkVendorPayments,
  useProcurement, useAddProcurement, useUpdateProcurement, useDeleteProcurement
} from "@/hooks/useData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import type { MilkVendor, VendorPayment, MilkProcurement, SessionType } from "@shared/types";

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState("procurement");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedSession, setSelectedSession] = useState<SessionType>("morning");
  const { toast } = useToast();

  // Data hooks
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: payments = [], isLoading: paymentsLoading } = useVendorPayments();
  const { data: procurement = [], isLoading: procurementLoading } = useProcurement();

  // Mutations
  const addVendor = useAddVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();
  const addPayment = useAddVendorPayment();
  const addBulkPayments = useAddBulkVendorPayments();
  const addProcurement = useAddProcurement();
  const updateProcurement = useUpdateProcurement();
  const deleteProcurement = useDeleteProcurement();

  // Dialog states
  const [procurementDialog, setProcurementDialog] = useState(false);
  const [vendorDialog, setVendorDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [bulkPaymentDialog, setBulkPaymentDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MilkProcurement | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<MilkVendor | null>(null);

  // Form states
  const [procurementForm, setProcurementForm] = useState({
    vendor_id: "", quantity_liters: "", fat_percentage: "", snf_percentage: "", rate_per_liter: "", notes: ""
  });
  const [vendorForm, setVendorForm] = useState({
    name: "", phone: "", address: "", area: "", bank_name: "", account_number: "", 
    ifsc_code: "", upi_id: "", default_rate: "", notes: "", is_active: true
  });
  const [paymentForm, setPaymentForm] = useState({
    vendor_id: "", amount: "", payment_mode: "bank_transfer" as VendorPayment['payment_mode'], 
    reference_number: "", notes: ""
  });
  const [bulkPaymentSelections, setBulkPaymentSelections] = useState<{[key: string]: { selected: boolean; amount: string }}>({});

  // Active vendors only
  const activeVendors = vendors.filter(v => v.is_active);

  // ============== PROCUREMENT TAB ==============
  const todayProcurement = procurement.filter(p => p.procurement_date === selectedDate);
  const morningTotal = todayProcurement.filter(p => p.session === "morning").reduce((sum, p) => sum + p.quantity_liters, 0);
  const eveningTotal = todayProcurement.filter(p => p.session === "evening").reduce((sum, p) => sum + p.quantity_liters, 0);
  const totalAmount = todayProcurement.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const pendingAmount = todayProcurement.filter(p => p.payment_status === "pending").reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const avgFat = todayProcurement.length > 0 ? todayProcurement.reduce((sum, p) => sum + (p.fat_percentage || 0), 0) / todayProcurement.length : 0;

  const procurementColumns: Column<MilkProcurement>[] = [
    { key: "vendor_name", header: "Vendor", sortable: true, render: (item) => <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{item.vendor_name}</span></div> },
    { key: "session", header: "Session", render: (item) => <Badge variant="outline" className="gap-1">{item.session === "morning" ? <Sun className="h-3 w-3 text-amber-500" /> : <Moon className="h-3 w-3 text-indigo-500" />}{item.session === "morning" ? "Morning" : "Evening"}</Badge> },
    { key: "quantity_liters", header: "Quantity", sortable: true, render: (item) => <span className="font-semibold text-primary">{item.quantity_liters} L</span> },
    { key: "fat_percentage", header: "Fat %", render: (item) => item.fat_percentage?.toFixed(1) || "-" },
    { key: "snf_percentage", header: "SNF %", render: (item) => item.snf_percentage?.toFixed(1) || "-" },
    { key: "rate_per_liter", header: "Rate/L", render: (item) => item.rate_per_liter ? `₹${item.rate_per_liter}` : "-" },
    { key: "total_amount", header: "Total", sortable: true, render: (item) => <span className="font-semibold">₹{item.total_amount?.toLocaleString("en-IN") || "-"}</span> },
    { key: "payment_status", header: "Payment", render: (item) => <Badge variant={item.payment_status === "paid" ? "default" : "secondary"} className={item.payment_status === "paid" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}>{item.payment_status === "paid" ? "Paid" : "Pending"}</Badge> },
  ];

  const procurementActions: Action<MilkProcurement>[] = [
    { label: "Edit", onClick: (item) => { 
      setSelectedRecord(item); 
      setProcurementForm({ 
        vendor_id: item.vendor_id, 
        quantity_liters: item.quantity_liters.toString(), 
        fat_percentage: item.fat_percentage?.toString() || "", 
        snf_percentage: item.snf_percentage?.toString() || "",
        rate_per_liter: item.rate_per_liter?.toString() || "", 
        notes: item.notes || "" 
      }); 
      setProcurementDialog(true); 
    }, icon: Edit },
    { label: "Delete", onClick: (item) => handleDeleteProcurement(item.id), icon: Trash2, variant: "destructive" },
  ];

  const handleSubmitProcurement = () => {
    if (!procurementForm.vendor_id || !procurementForm.quantity_liters) {
      toast({ title: "Validation Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }
    const vendor = vendors.find(v => v.id === procurementForm.vendor_id);
    const quantity = parseFloat(procurementForm.quantity_liters);
    const rate = procurementForm.rate_per_liter ? parseFloat(procurementForm.rate_per_liter) : (vendor?.default_rate || 0);
    const total = quantity * rate;

    const data = {
      vendor_id: procurementForm.vendor_id,
      vendor_name: vendor?.name,
      procurement_date: selectedDate,
      session: selectedSession,
      quantity_liters: quantity,
      fat_percentage: procurementForm.fat_percentage ? parseFloat(procurementForm.fat_percentage) : undefined,
      snf_percentage: procurementForm.snf_percentage ? parseFloat(procurementForm.snf_percentage) : undefined,
      rate_per_liter: rate,
      total_amount: total,
      payment_status: "pending",
      notes: procurementForm.notes || undefined,
    };

    if (selectedRecord) {
      updateProcurement.mutate({ id: selectedRecord.id, ...data }, {
        onSuccess: () => { toast({ title: "Procurement Updated" }); resetProcurementForm(); }
      });
    } else {
      addProcurement.mutate(data as any, {
        onSuccess: () => { toast({ title: "Procurement Added" }); resetProcurementForm(); }
      });
    }
  };

  const handleDeleteProcurement = (id: string) => {
    deleteProcurement.mutate(id, { onSuccess: () => toast({ title: "Record Deleted" }) });
  };

  const resetProcurementForm = () => {
    setProcurementForm({ vendor_id: "", quantity_liters: "", fat_percentage: "", snf_percentage: "", rate_per_liter: "", notes: "" });
    setSelectedRecord(null);
    setProcurementDialog(false);
  };

  // ============== VENDORS TAB ==============
  const vendorColumns: Column<MilkVendor>[] = [
    { key: "name", header: "Name", sortable: true, render: (item) => <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><span className="font-medium">{item.name}</span></div> },
    { key: "phone", header: "Phone", render: (item) => item.phone ? <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{item.phone}</div> : "-" },
    { key: "area", header: "Area", render: (item) => item.area ? <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" />{item.area}</div> : "-" },
    { key: "default_rate", header: "Rate/L", render: (item) => item.default_rate ? `₹${item.default_rate}` : "-" },
    { key: "current_balance", header: "Pending", sortable: true, render: (item) => <span className={`font-semibold ${item.current_balance > 0 ? 'text-amber-600' : 'text-green-600'}`}>₹{item.current_balance.toLocaleString("en-IN")}</span> },
    { key: "total_procurement", header: "Total Business", render: (item) => <span className="text-muted-foreground">₹{(item.total_procurement || 0).toLocaleString("en-IN")}</span> },
    { key: "is_active", header: "Status", render: (item) => <Badge variant={item.is_active ? "default" : "secondary"} className={item.is_active ? "bg-green-500/10 text-green-600" : ""}>{item.is_active ? "Active" : "Inactive"}</Badge> },
  ];

  const vendorActions: Action<MilkVendor>[] = [
    { label: "Edit", onClick: (item) => { 
      setSelectedVendor(item);
      setVendorForm({
        name: item.name,
        phone: item.phone || "",
        address: item.address || "",
        area: item.area || "",
        bank_name: item.bank_name || "",
        account_number: item.account_number || "",
        ifsc_code: item.ifsc_code || "",
        upi_id: item.upi_id || "",
        default_rate: item.default_rate?.toString() || "",
        notes: item.notes || "",
        is_active: item.is_active,
      });
      setVendorDialog(true);
    }, icon: Edit },
    { label: "Pay", onClick: (item) => { 
      setPaymentForm({ vendor_id: item.id, amount: item.current_balance.toString(), payment_mode: "bank_transfer", reference_number: "", notes: "" });
      setPaymentDialog(true);
    }, icon: CreditCard },
    { label: "Delete", onClick: (item) => handleDeleteVendor(item.id), icon: Trash2, variant: "destructive" },
  ];

  const handleSubmitVendor = () => {
    if (!vendorForm.name) {
      toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
      return;
    }

    const data = {
      name: vendorForm.name,
      phone: vendorForm.phone || undefined,
      address: vendorForm.address || undefined,
      area: vendorForm.area || undefined,
      bank_name: vendorForm.bank_name || undefined,
      account_number: vendorForm.account_number || undefined,
      ifsc_code: vendorForm.ifsc_code || undefined,
      upi_id: vendorForm.upi_id || undefined,
      default_rate: vendorForm.default_rate ? parseFloat(vendorForm.default_rate) : undefined,
      notes: vendorForm.notes || undefined,
      is_active: vendorForm.is_active,
    };

    if (selectedVendor) {
      updateVendor.mutate({ id: selectedVendor.id, ...data }, {
        onSuccess: () => { toast({ title: "Vendor Updated" }); resetVendorForm(); }
      });
    } else {
      addVendor.mutate(data as any, {
        onSuccess: () => { toast({ title: "Vendor Added" }); resetVendorForm(); }
      });
    }
  };

  const handleDeleteVendor = (id: string) => {
    deleteVendor.mutate(id, { onSuccess: () => toast({ title: "Vendor Deleted" }) });
  };

  const resetVendorForm = () => {
    setVendorForm({ name: "", phone: "", address: "", area: "", bank_name: "", account_number: "", ifsc_code: "", upi_id: "", default_rate: "", notes: "", is_active: true });
    setSelectedVendor(null);
    setVendorDialog(false);
  };

  // ============== PAYMENTS TAB ==============
  const paymentColumns: Column<VendorPayment>[] = [
    { key: "payment_date", header: "Date", sortable: true, render: (item) => format(new Date(item.payment_date), "dd MMM yyyy") },
    { key: "vendor_name", header: "Vendor", sortable: true, render: (item) => <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><span className="font-medium">{item.vendor_name}</span></div> },
    { key: "amount", header: "Amount", sortable: true, render: (item) => <span className="font-semibold text-green-600">₹{item.amount.toLocaleString("en-IN")}</span> },
    { key: "payment_mode", header: "Mode", render: (item) => {
      const modeLabels: Record<string, { label: string; icon: typeof Banknote }> = {
        'cash': { label: 'Cash', icon: Banknote },
        'bank_transfer': { label: 'Bank', icon: Building2 },
        'upi': { label: 'UPI', icon: Phone },
        'cheque': { label: 'Cheque', icon: CreditCard },
      };
      const mode = modeLabels[item.payment_mode];
      return <Badge variant="outline" className="gap-1"><mode.icon className="h-3 w-3" />{mode.label}</Badge>;
    }},
    { key: "reference_number", header: "Reference", render: (item) => item.reference_number || "-" },
    { key: "notes", header: "Notes", render: (item) => item.notes || "-" },
  ];

  const handleSubmitPayment = () => {
    if (!paymentForm.vendor_id || !paymentForm.amount) {
      toast({ title: "Validation Error", description: "Vendor and amount are required", variant: "destructive" });
      return;
    }
    const vendor = vendors.find(v => v.id === paymentForm.vendor_id);

    addPayment.mutate({
      vendor_id: paymentForm.vendor_id,
      vendor_name: vendor?.name,
      payment_date: format(new Date(), "yyyy-MM-dd"),
      amount: parseFloat(paymentForm.amount),
      payment_mode: paymentForm.payment_mode,
      reference_number: paymentForm.reference_number || undefined,
      notes: paymentForm.notes || undefined,
    }, {
      onSuccess: () => { toast({ title: "Payment Recorded" }); resetPaymentForm(); }
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({ vendor_id: "", amount: "", payment_mode: "bank_transfer", reference_number: "", notes: "" });
    setPaymentDialog(false);
  };

  // Bulk payment
  const totalPendingBalance = activeVendors.reduce((sum, v) => sum + v.current_balance, 0);
  const vendorsWithBalance = activeVendors.filter(v => v.current_balance > 0);

  const initializeBulkPayments = () => {
    const selections: {[key: string]: { selected: boolean; amount: string }} = {};
    vendorsWithBalance.forEach(v => {
      selections[v.id] = { selected: true, amount: v.current_balance.toString() };
    });
    setBulkPaymentSelections(selections);
    setBulkPaymentDialog(true);
  };

  const handleBulkPayment = () => {
    const paymentsToMake = Object.entries(bulkPaymentSelections)
      .filter(([_, val]) => val.selected && parseFloat(val.amount) > 0)
      .map(([vendorId, val]) => {
        const vendor = vendors.find(v => v.id === vendorId);
        return {
          vendor_id: vendorId,
          vendor_name: vendor?.name,
          payment_date: format(new Date(), "yyyy-MM-dd"),
          amount: parseFloat(val.amount),
          payment_mode: 'bank_transfer' as const,
          notes: 'Bulk payment',
        };
      });

    if (paymentsToMake.length === 0) {
      toast({ title: "No payments selected", variant: "destructive" });
      return;
    }

    addBulkPayments.mutate(paymentsToMake, {
      onSuccess: () => {
        toast({ title: `${paymentsToMake.length} Payments Recorded` });
        setBulkPaymentDialog(false);
        setBulkPaymentSelections({});
      }
    });
  };

  // ============== ANALYTICS TAB ==============
  const vendorAnalytics = useMemo(() => {
    const vendorStats = vendors.map(vendor => {
      const vendorProcurement = procurement.filter(p => p.vendor_id === vendor.id);
      const totalLiters = vendorProcurement.reduce((sum, p) => sum + p.quantity_liters, 0);
      const avgFat = vendorProcurement.length > 0 
        ? vendorProcurement.reduce((sum, p) => sum + (p.fat_percentage || 0), 0) / vendorProcurement.length 
        : 0;
      const avgSNF = vendorProcurement.length > 0 
        ? vendorProcurement.reduce((sum, p) => sum + (p.snf_percentage || 0), 0) / vendorProcurement.length 
        : 0;
      const totalAmount = vendorProcurement.reduce((sum, p) => sum + (p.total_amount || 0), 0);

      return {
        id: vendor.id,
        name: vendor.name,
        totalLiters,
        avgFat,
        avgSNF,
        totalAmount,
        pendingBalance: vendor.current_balance,
        deliveries: vendorProcurement.length,
      };
    }).filter(v => v.deliveries > 0);

    return vendorStats.sort((a, b) => b.totalLiters - a.totalLiters);
  }, [vendors, procurement]);

  const volumeChartData = vendorAnalytics.slice(0, 6).map(v => ({
    name: v.name.split(' ')[0],
    liters: v.totalLiters,
    amount: v.totalAmount,
  }));

  const qualityChartData = vendorAnalytics.slice(0, 6).map(v => ({
    name: v.name.split(' ')[0],
    fat: parseFloat(v.avgFat.toFixed(1)),
    snf: parseFloat(v.avgSNF.toFixed(1)),
  }));

  const pieData = vendorAnalytics.slice(0, 5).map(v => ({
    name: v.name,
    value: v.totalLiters,
  }));

  const totalProcuredLiters = procurement.reduce((sum, p) => sum + p.quantity_liters, 0);
  const totalProcuredAmount = procurement.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const overallAvgFat = procurement.length > 0 
    ? procurement.reduce((sum, p) => sum + (p.fat_percentage || 0), 0) / procurement.length 
    : 0;

  // Get page action based on tab
  const getPageAction = () => {
    switch (activeTab) {
      case "procurement":
        return { label: "Add Procurement", onClick: () => { resetProcurementForm(); setProcurementDialog(true); } };
      case "vendors":
        return { label: "Add Vendor", onClick: () => { resetVendorForm(); setVendorDialog(true); } };
      case "payments":
        return { label: "Record Payment", onClick: () => { resetPaymentForm(); setPaymentDialog(true); } };
      default:
        return undefined;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Milk Procurement" 
        description="Manage vendors, track milk purchases, and process payments"
        action={getPageAction()}
      >
        <Button variant="outline" size="sm" data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />Export
        </Button>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-4">
          <TabsTrigger value="procurement" className="gap-2" data-testid="tab-procurement">
            <ShoppingCart className="h-4 w-4" />Procurement
          </TabsTrigger>
          <TabsTrigger value="vendors" className="gap-2" data-testid="tab-vendors">
            <Users className="h-4 w-4" />Vendors
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2" data-testid="tab-payments">
            <CreditCard className="h-4 w-4" />Payments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4" />Analytics
          </TabsTrigger>
        </TabsList>

        {/* PROCUREMENT TAB */}
        <TabsContent value="procurement" className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="w-auto" 
              data-testid="input-procurement-date" 
            />
            <Tabs value={selectedSession} onValueChange={(v) => setSelectedSession(v as SessionType)}>
              <TabsList>
                <TabsTrigger value="morning" className="gap-2"><Sun className="h-4 w-4" />Morning</TabsTrigger>
                <TabsTrigger value="evening" className="gap-2"><Moon className="h-4 w-4" />Evening</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Today's Total</p>
                </div>
                <p className="text-2xl font-bold text-primary">{(morningTotal + eveningTotal).toFixed(1)} L</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <p className="text-sm text-muted-foreground">Morning</p>
                </div>
                <p className="text-2xl font-bold text-amber-600">{morningTotal.toFixed(1)} L</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <p className="text-sm text-muted-foreground">Evening</p>
                </div>
                <p className="text-2xl font-bold text-indigo-600">{eveningTotal.toFixed(1)} L</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
                <p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-muted-foreground">Avg Fat %</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">{avgFat.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </motion.div>

          <Card>
            <CardContent className="p-0">
              <DataTable
                data={todayProcurement}
                columns={procurementColumns}
                actions={procurementActions}
                searchPlaceholder="Search procurement..."
                isLoading={procurementLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* VENDORS TAB */}
        <TabsContent value="vendors" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Vendors</p>
                </div>
                <p className="text-2xl font-bold">{vendors.length}</p>
                <p className="text-xs text-muted-foreground">{activeVendors.length} active</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-muted-foreground">Pending Balance</p>
                </div>
                <p className="text-2xl font-bold text-amber-600">₹{totalPendingBalance.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground">{vendorsWithBalance.length} vendors</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-muted-foreground">Total Procurement</p>
                </div>
                <p className="text-2xl font-bold text-green-600">₹{vendors.reduce((s, v) => s + (v.total_procurement || 0), 0).toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                </div>
                <p className="text-2xl font-bold">₹{vendors.reduce((s, v) => s + (v.total_paid || 0), 0).toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <DataTable
                data={vendors}
                columns={vendorColumns}
                actions={vendorActions}
                searchPlaceholder="Search vendors..."
                isLoading={vendorsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments" className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
              <Card className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                  </div>
                  <p className="text-2xl font-bold">{payments.length}</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Banknote className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{payments.reduce((s, p) => s + p.amount, 0).toLocaleString("en-IN")}</p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <p className="text-sm text-muted-foreground">Pending Dues</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">₹{totalPendingBalance.toLocaleString("en-IN")}</p>
                </CardContent>
              </Card>
            </div>
            <Button onClick={initializeBulkPayments} disabled={vendorsWithBalance.length === 0} data-testid="button-bulk-payment">
              <Banknote className="h-4 w-4 mr-2" />Bulk Payment
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <DataTable
                data={payments}
                columns={paymentColumns}
                searchPlaceholder="Search payments..."
                isLoading={paymentsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Total Procured</p>
                </div>
                <p className="text-2xl font-bold text-primary">{totalProcuredLiters.toLocaleString("en-IN")} L</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
                <p className="text-2xl font-bold text-green-600">₹{totalProcuredAmount.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-muted-foreground">Avg Fat %</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">{overallAvgFat.toFixed(2)}%</p>
              </CardContent>
            </Card>
            <Card className="hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Active Vendors</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{activeVendors.length}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Vendor Volume Comparison
                </CardTitle>
                <CardDescription>Total liters procured by vendor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: 8 }}
                        formatter={(value: number) => [`${value.toLocaleString()} L`, 'Volume']}
                      />
                      <Bar dataKey="liters" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="h-4 w-4 text-purple-600" />
                  Quality Comparison
                </CardTitle>
                <CardDescription>Fat & SNF percentages by vendor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qualityChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
                      <Tooltip contentStyle={{ borderRadius: 8 }} />
                      <Legend />
                      <Bar dataKey="fat" name="Fat %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="snf" name="SNF %" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  Procurement Share
                </CardTitle>
                <CardDescription>Volume distribution by vendor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value.toLocaleString()} L`, 'Volume']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Top Vendors
                </CardTitle>
                <CardDescription>Performance ranking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vendorAnalytics.slice(0, 5).map((vendor, index) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-xs text-muted-foreground">{vendor.deliveries} deliveries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{vendor.totalLiters.toLocaleString()} L</p>
                        <p className="text-xs text-muted-foreground">Fat: {vendor.avgFat.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Procurement Dialog */}
      <Dialog open={procurementDialog} onOpenChange={setProcurementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRecord ? "Edit Procurement" : "Add Procurement"}</DialogTitle>
            <DialogDescription>Record milk procurement from vendor</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Vendor *</Label>
              <Select value={procurementForm.vendor_id} onValueChange={(v) => {
                const vendor = vendors.find(vnd => vnd.id === v);
                setProcurementForm(prev => ({ 
                  ...prev, 
                  vendor_id: v, 
                  rate_per_liter: vendor?.default_rate?.toString() || prev.rate_per_liter 
                }));
              }}>
                <SelectTrigger data-testid="select-vendor">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {activeVendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity (L) *</Label>
                <Input 
                  type="number" 
                  value={procurementForm.quantity_liters} 
                  onChange={(e) => setProcurementForm(prev => ({ ...prev, quantity_liters: e.target.value }))}
                  data-testid="input-quantity"
                />
              </div>
              <div className="space-y-2">
                <Label>Rate/Liter (₹)</Label>
                <Input 
                  type="number" 
                  value={procurementForm.rate_per_liter} 
                  onChange={(e) => setProcurementForm(prev => ({ ...prev, rate_per_liter: e.target.value }))}
                  data-testid="input-rate"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fat %</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={procurementForm.fat_percentage} 
                  onChange={(e) => setProcurementForm(prev => ({ ...prev, fat_percentage: e.target.value }))}
                  data-testid="input-fat"
                />
              </div>
              <div className="space-y-2">
                <Label>SNF %</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={procurementForm.snf_percentage} 
                  onChange={(e) => setProcurementForm(prev => ({ ...prev, snf_percentage: e.target.value }))}
                  data-testid="input-snf"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={procurementForm.notes} 
                onChange={(e) => setProcurementForm(prev => ({ ...prev, notes: e.target.value }))}
                data-testid="input-procurement-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetProcurementForm}>Cancel</Button>
            <Button onClick={handleSubmitProcurement} disabled={addProcurement.isPending || updateProcurement.isPending} data-testid="button-submit-procurement">
              {selectedRecord ? "Update" : "Add"} Procurement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor Dialog */}
      <Dialog open={vendorDialog} onOpenChange={setVendorDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedVendor ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
            <DialogDescription>Manage vendor details and payment information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input 
                  value={vendorForm.name} 
                  onChange={(e) => setVendorForm(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-vendor-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={vendorForm.phone} 
                  onChange={(e) => setVendorForm(prev => ({ ...prev, phone: e.target.value }))}
                  data-testid="input-vendor-phone"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Area</Label>
                <Input 
                  value={vendorForm.area} 
                  onChange={(e) => setVendorForm(prev => ({ ...prev, area: e.target.value }))}
                  data-testid="input-vendor-area"
                />
              </div>
              <div className="space-y-2">
                <Label>Default Rate/L (₹)</Label>
                <Input 
                  type="number"
                  value={vendorForm.default_rate} 
                  onChange={(e) => setVendorForm(prev => ({ ...prev, default_rate: e.target.value }))}
                  data-testid="input-vendor-rate"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea 
                value={vendorForm.address} 
                onChange={(e) => setVendorForm(prev => ({ ...prev, address: e.target.value }))}
                data-testid="input-vendor-address"
              />
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Payment Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input 
                    value={vendorForm.bank_name} 
                    onChange={(e) => setVendorForm(prev => ({ ...prev, bank_name: e.target.value }))}
                    data-testid="input-vendor-bank"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input 
                    value={vendorForm.account_number} 
                    onChange={(e) => setVendorForm(prev => ({ ...prev, account_number: e.target.value }))}
                    data-testid="input-vendor-account"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input 
                    value={vendorForm.ifsc_code} 
                    onChange={(e) => setVendorForm(prev => ({ ...prev, ifsc_code: e.target.value }))}
                    data-testid="input-vendor-ifsc"
                  />
                </div>
                <div className="space-y-2">
                  <Label>UPI ID</Label>
                  <Input 
                    value={vendorForm.upi_id} 
                    onChange={(e) => setVendorForm(prev => ({ ...prev, upi_id: e.target.value }))}
                    data-testid="input-vendor-upi"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={vendorForm.notes} 
                onChange={(e) => setVendorForm(prev => ({ ...prev, notes: e.target.value }))}
                data-testid="input-vendor-notes"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_active" 
                checked={vendorForm.is_active}
                onCheckedChange={(checked) => setVendorForm(prev => ({ ...prev, is_active: checked as boolean }))}
              />
              <Label htmlFor="is_active">Active Vendor</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetVendorForm}>Cancel</Button>
            <Button onClick={handleSubmitVendor} disabled={addVendor.isPending || updateVendor.isPending} data-testid="button-submit-vendor">
              {selectedVendor ? "Update" : "Add"} Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Record a payment to vendor</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Vendor *</Label>
              <Select value={paymentForm.vendor_id} onValueChange={(v) => {
                const vendor = vendors.find(vnd => vnd.id === v);
                setPaymentForm(prev => ({ ...prev, vendor_id: v, amount: vendor?.current_balance.toString() || "" }));
              }}>
                <SelectTrigger data-testid="select-payment-vendor">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {activeVendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} (₹{v.current_balance.toLocaleString("en-IN")} pending)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (₹) *</Label>
                <Input 
                  type="number" 
                  value={paymentForm.amount} 
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  data-testid="input-payment-amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select value={paymentForm.payment_mode} onValueChange={(v) => setPaymentForm(prev => ({ ...prev, payment_mode: v as VendorPayment['payment_mode'] }))}>
                  <SelectTrigger data-testid="select-payment-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input 
                value={paymentForm.reference_number} 
                onChange={(e) => setPaymentForm(prev => ({ ...prev, reference_number: e.target.value }))}
                placeholder="Transaction ID / Cheque No."
                data-testid="input-payment-reference"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={paymentForm.notes} 
                onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                data-testid="input-payment-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetPaymentForm}>Cancel</Button>
            <Button onClick={handleSubmitPayment} disabled={addPayment.isPending} data-testid="button-submit-payment">
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Payment Dialog */}
      <Dialog open={bulkPaymentDialog} onOpenChange={setBulkPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Payment</DialogTitle>
            <DialogDescription>Pay multiple vendors at once</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[50vh] overflow-y-auto">
            <div className="space-y-3">
              {vendorsWithBalance.map(vendor => (
                <div key={vendor.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={bulkPaymentSelections[vendor.id]?.selected || false}
                      onCheckedChange={(checked) => setBulkPaymentSelections(prev => ({
                        ...prev,
                        [vendor.id]: { ...prev[vendor.id], selected: checked as boolean }
                      }))}
                    />
                    <div>
                      <p className="font-medium">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground">Pending: ₹{vendor.current_balance.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">₹</span>
                    <Input 
                      type="number"
                      className="w-32"
                      value={bulkPaymentSelections[vendor.id]?.amount || ""}
                      onChange={(e) => setBulkPaymentSelections(prev => ({
                        ...prev,
                        [vendor.id]: { ...prev[vendor.id], amount: e.target.value }
                      }))}
                      disabled={!bulkPaymentSelections[vendor.id]?.selected}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Selected Vendors</p>
              <p className="font-bold text-lg">
                {Object.values(bulkPaymentSelections).filter(v => v.selected).length} / {vendorsWithBalance.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Payment</p>
              <p className="font-bold text-lg text-green-600">
                ₹{Object.entries(bulkPaymentSelections)
                  .filter(([_, val]) => val.selected && parseFloat(val.amount) > 0)
                  .reduce((sum, [_, val]) => sum + parseFloat(val.amount), 0)
                  .toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkPayment} disabled={addBulkPayments.isPending} data-testid="button-submit-bulk-payment">
              Process Payments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
