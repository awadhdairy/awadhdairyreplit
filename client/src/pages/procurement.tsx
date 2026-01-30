import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, ShoppingCart, Sun, Moon, Download, Edit, Trash2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import type { MilkProcurement, SessionType } from "@shared/types";

const sampleProcurement: MilkProcurement[] = [
  { id: "1", vendor_id: "1", vendor_name: "Ramesh Farmer", procurement_date: "2024-01-30", session: "morning", quantity_liters: 50, fat_percentage: 4.5, rate_per_liter: 45, total_amount: 2250, payment_status: "pending", created_at: "2024-01-30" },
  { id: "2", vendor_id: "2", vendor_name: "Suresh Dairy", procurement_date: "2024-01-30", session: "morning", quantity_liters: 80, fat_percentage: 4.2, rate_per_liter: 42, total_amount: 3360, payment_status: "paid", created_at: "2024-01-30" },
  { id: "3", vendor_id: "1", vendor_name: "Ramesh Farmer", procurement_date: "2024-01-30", session: "evening", quantity_liters: 45, fat_percentage: 4.3, rate_per_liter: 45, total_amount: 2025, payment_status: "pending", created_at: "2024-01-30" },
  { id: "4", vendor_id: "3", vendor_name: "Gopal Singh", procurement_date: "2024-01-29", session: "morning", quantity_liters: 60, fat_percentage: 5.0, rate_per_liter: 50, total_amount: 3000, payment_status: "paid", created_at: "2024-01-29" },
];

const vendors = [
  { id: "1", name: "Ramesh Farmer" },
  { id: "2", name: "Suresh Dairy" },
  { id: "3", name: "Gopal Singh" },
];

export default function ProcurementPage() {
  const [procurement, setProcurement] = useState<MilkProcurement[]>(sampleProcurement);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedSession, setSelectedSession] = useState<SessionType>("morning");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MilkProcurement | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ vendor_id: "", quantity_liters: "", fat_percentage: "", rate_per_liter: "", notes: "" });

  const todayProcurement = procurement.filter(p => p.procurement_date === selectedDate);
  const morningTotal = todayProcurement.filter(p => p.session === "morning").reduce((sum, p) => sum + p.quantity_liters, 0);
  const eveningTotal = todayProcurement.filter(p => p.session === "evening").reduce((sum, p) => sum + p.quantity_liters, 0);
  const totalAmount = todayProcurement.reduce((sum, p) => sum + (p.total_amount || 0), 0);
  const pendingAmount = todayProcurement.filter(p => p.payment_status === "pending").reduce((sum, p) => sum + (p.total_amount || 0), 0);

  const columns: Column<MilkProcurement>[] = [
    { key: "vendor_name", header: "Vendor", sortable: true, render: (item) => <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{item.vendor_name}</span></div> },
    { key: "session", header: "Session", render: (item) => <Badge variant="outline" className="gap-1">{item.session === "morning" ? <Sun className="h-3 w-3 text-amber-500" /> : <Moon className="h-3 w-3 text-indigo-500" />}{item.session === "morning" ? "Morning" : "Evening"}</Badge> },
    { key: "quantity_liters", header: "Quantity", sortable: true, render: (item) => <span className="font-semibold text-primary">{item.quantity_liters} L</span> },
    { key: "fat_percentage", header: "Fat %", render: (item) => item.fat_percentage?.toFixed(1) || "-" },
    { key: "rate_per_liter", header: "Rate/L", render: (item) => item.rate_per_liter ? `₹${item.rate_per_liter}` : "-" },
    { key: "total_amount", header: "Total", sortable: true, render: (item) => <span className="font-semibold">₹{item.total_amount?.toLocaleString("en-IN") || "-"}</span> },
    { key: "payment_status", header: "Payment", render: (item) => <Badge variant={item.payment_status === "paid" ? "default" : "secondary"} className={item.payment_status === "paid" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}>{item.payment_status === "paid" ? "Paid" : "Pending"}</Badge> },
  ];

  const actions: Action<MilkProcurement>[] = [
    { label: "Edit", onClick: (item) => { setSelectedRecord(item); setFormData({ vendor_id: item.vendor_id, quantity_liters: item.quantity_liters.toString(), fat_percentage: item.fat_percentage?.toString() || "", rate_per_liter: item.rate_per_liter?.toString() || "", notes: item.notes || "" }); setIsDialogOpen(true); }, icon: Edit },
    { label: "Delete", onClick: (item) => { setProcurement(prev => prev.filter(p => p.id !== item.id)); toast({ title: "Record Deleted" }); }, icon: Trash2, variant: "destructive" },
  ];

  const handleSubmit = () => {
    if (!formData.vendor_id || !formData.quantity_liters) { toast({ title: "Validation Error", description: "Please fill required fields", variant: "destructive" }); return; }
    const vendor = vendors.find(v => v.id === formData.vendor_id);
    const quantity = parseFloat(formData.quantity_liters);
    const rate = formData.rate_per_liter ? parseFloat(formData.rate_per_liter) : 0;
    const total = quantity * rate;

    if (selectedRecord) {
      setProcurement(prev => prev.map(p => p.id === selectedRecord.id ? { ...p, vendor_id: formData.vendor_id, vendor_name: vendor?.name, quantity_liters: quantity, fat_percentage: formData.fat_percentage ? parseFloat(formData.fat_percentage) : undefined, rate_per_liter: rate, total_amount: total, notes: formData.notes } : p));
      toast({ title: "Record Updated" });
    } else {
      const newRecord: MilkProcurement = { id: Date.now().toString(), vendor_id: formData.vendor_id, vendor_name: vendor?.name, procurement_date: selectedDate, session: selectedSession, quantity_liters: quantity, fat_percentage: formData.fat_percentage ? parseFloat(formData.fat_percentage) : undefined, rate_per_liter: rate, total_amount: total, payment_status: "pending", notes: formData.notes, created_at: new Date().toISOString() };
      setProcurement(prev => [...prev, newRecord]);
      toast({ title: "Procurement Added" });
    }
    resetForm();
  };

  const resetForm = () => { setFormData({ vendor_id: "", quantity_liters: "", fat_percentage: "", rate_per_liter: "", notes: "" }); setSelectedRecord(null); setIsDialogOpen(false); };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Milk Procurement" description="Record milk purchased from vendors" action={{ label: "Add Procurement", onClick: () => { resetForm(); setIsDialogOpen(true); } }}>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-4">
        <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-auto" data-testid="input-procurement-date" />
        <Tabs value={selectedSession} onValueChange={(v) => setSelectedSession(v as SessionType)}>
          <TabsList>
            <TabsTrigger value="morning" className="gap-2"><Sun className="h-4 w-4" />Morning</TabsTrigger>
            <TabsTrigger value="evening" className="gap-2"><Moon className="h-4 w-4" />Evening</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Today's Total</p><p className="text-2xl font-bold text-primary">{(morningTotal + eveningTotal).toFixed(1)} L</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-2"><Sun className="h-4 w-4 text-amber-500" /><p className="text-sm text-muted-foreground">Morning</p></div><p className="text-2xl font-bold text-amber-600">{morningTotal.toFixed(1)} L</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Amount</p><p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString("en-IN")}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pending Payment</p><p className="text-2xl font-bold text-red-600">₹{pendingAmount.toLocaleString("en-IN")}</p></CardContent></Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={todayProcurement.filter(p => p.session === selectedSession)} columns={columns} actions={actions} searchKey="vendor_name" searchPlaceholder="Search vendors..." emptyMessage={`No ${selectedSession} procurement records for ${format(new Date(selectedDate), "dd MMM yyyy")}`} />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selectedRecord ? "Edit Procurement" : "Add Procurement"}</DialogTitle><DialogDescription>Record milk procurement from vendor</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Vendor *</Label><Select value={formData.vendor_id} onValueChange={(v) => setFormData({...formData, vendor_id: v})}><SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Quantity (L) *</Label><Input type="number" step="0.1" value={formData.quantity_liters} onChange={(e) => setFormData({...formData, quantity_liters: e.target.value})} placeholder="e.g., 50" /></div>
              <div className="space-y-2"><Label>Fat %</Label><Input type="number" step="0.1" value={formData.fat_percentage} onChange={(e) => setFormData({...formData, fat_percentage: e.target.value})} placeholder="e.g., 4.5" /></div>
            </div>
            <div className="space-y-2"><Label>Rate per Liter (₹)</Label><Input type="number" value={formData.rate_per_liter} onChange={(e) => setFormData({...formData, rate_per_liter: e.target.value})} placeholder="e.g., 45" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetForm}>Cancel</Button><Button onClick={handleSubmit}>{selectedRecord ? "Update" : "Add"} Procurement</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
