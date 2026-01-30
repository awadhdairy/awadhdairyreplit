import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Package, ArrowUpCircle, ArrowDownCircle, AlertCircle, Download, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import type { Bottle, BottleType, BottleSize } from "@shared/types";

const sampleBottles: Bottle[] = [
  { id: "1", bottle_type: "glass", size: "500ml", total_quantity: 200, available_quantity: 150, deposit_amount: 30, created_at: "2024-01-01" },
  { id: "2", bottle_type: "glass", size: "1l", total_quantity: 300, available_quantity: 220, deposit_amount: 50, created_at: "2024-01-01" },
  { id: "3", bottle_type: "plastic", size: "500ml", total_quantity: 150, available_quantity: 120, deposit_amount: 20, created_at: "2024-01-01" },
  { id: "4", bottle_type: "plastic", size: "1l", total_quantity: 200, available_quantity: 180, deposit_amount: 35, created_at: "2024-01-01" },
];

export default function BottlesPage() {
  const [bottles, setBottles] = useState<Bottle[]>(sampleBottles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ bottle_type: "glass" as BottleType, size: "1l" as BottleSize, total_quantity: "", deposit_amount: "" });
  const [transactionData, setTransactionData] = useState({ type: "issued", quantity: "", customer: "" });

  const stats = {
    total: bottles.reduce((sum, b) => sum + b.total_quantity, 0),
    available: bottles.reduce((sum, b) => sum + b.available_quantity, 0),
    issued: bottles.reduce((sum, b) => sum + (b.total_quantity - b.available_quantity), 0),
    depositValue: bottles.reduce((sum, b) => sum + ((b.total_quantity - b.available_quantity) * b.deposit_amount), 0),
  };

  const columns: Column<Bottle>[] = [
    { key: "bottle_type", header: "Type", render: (item) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div>
        <div><span className="font-medium capitalize">{item.bottle_type}</span><p className="text-xs text-muted-foreground">{item.size}</p></div>
      </div>
    ) },
    { key: "total_quantity", header: "Total", sortable: true },
    { key: "available_quantity", header: "Available", sortable: true, render: (item) => <span className={item.available_quantity < 20 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>{item.available_quantity}</span> },
    { key: "issued", header: "Issued", render: (item) => <span className="text-amber-600">{item.total_quantity - item.available_quantity}</span> },
    { key: "deposit_amount", header: "Deposit", render: (item) => `₹${item.deposit_amount}` },
    { key: "value", header: "Issued Value", render: (item) => <span className="font-medium text-primary">₹{((item.total_quantity - item.available_quantity) * item.deposit_amount).toLocaleString("en-IN")}</span> },
  ];

  const actions: Action<Bottle>[] = [
    { label: "Issue/Return", onClick: (item) => { setSelectedBottle(item); setTransactionData({ type: "issued", quantity: "", customer: "" }); setIsTransactionDialogOpen(true); }, icon: ArrowUpCircle },
    { label: "Edit", onClick: (item) => { setSelectedBottle(item); setFormData({ bottle_type: item.bottle_type, size: item.size, total_quantity: item.total_quantity.toString(), deposit_amount: item.deposit_amount.toString() }); setIsDialogOpen(true); }, icon: Edit },
  ];

  const handleSubmit = () => {
    if (!formData.total_quantity || !formData.deposit_amount) { toast({ title: "Validation Error", description: "Please fill all fields", variant: "destructive" }); return; }
    if (selectedBottle) {
      setBottles(prev => prev.map(b => b.id === selectedBottle.id ? { ...b, ...formData, total_quantity: parseInt(formData.total_quantity), available_quantity: parseInt(formData.total_quantity) - (selectedBottle.total_quantity - selectedBottle.available_quantity), deposit_amount: parseFloat(formData.deposit_amount) } : b));
      toast({ title: "Bottle Updated" });
    } else {
      const newBottle: Bottle = { id: Date.now().toString(), ...formData, total_quantity: parseInt(formData.total_quantity), available_quantity: parseInt(formData.total_quantity), deposit_amount: parseFloat(formData.deposit_amount), created_at: new Date().toISOString() };
      setBottles(prev => [...prev, newBottle]);
      toast({ title: "Bottle Added" });
    }
    resetForm();
  };

  const handleTransaction = () => {
    if (!selectedBottle || !transactionData.quantity) return;
    const qty = parseInt(transactionData.quantity);
    if (transactionData.type === "issued" && qty > selectedBottle.available_quantity) { toast({ title: "Error", description: "Not enough bottles available", variant: "destructive" }); return; }

    setBottles(prev => prev.map(b => {
      if (b.id === selectedBottle.id) {
        const newAvailable = transactionData.type === "issued" ? b.available_quantity - qty : b.available_quantity + qty;
        return { ...b, available_quantity: Math.max(0, Math.min(newAvailable, b.total_quantity)) };
      }
      return b;
    }));
    toast({ title: transactionData.type === "issued" ? "Bottles Issued" : "Bottles Returned", description: `${qty} bottles ${transactionData.type}` });
    setIsTransactionDialogOpen(false);
  };

  const resetForm = () => { setFormData({ bottle_type: "glass", size: "1l", total_quantity: "", deposit_amount: "" }); setSelectedBottle(null); setIsDialogOpen(false); };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Bottle Management" description="Track bottle inventory and deposits" action={{ label: "Add Bottle Type", onClick: () => { resetForm(); setIsDialogOpen(true); } }}>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Bottles</p><p className="text-2xl font-bold text-primary">{stats.total}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Available</p><p className="text-2xl font-bold text-green-600">{stats.available}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Issued to Customers</p><p className="text-2xl font-bold text-amber-600">{stats.issued}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Deposit Value (Issued)</p><p className="text-2xl font-bold text-blue-600">₹{stats.depositValue.toLocaleString("en-IN")}</p></CardContent></Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={bottles} columns={columns} actions={actions} searchKey="bottle_type" searchPlaceholder="Search bottles..." emptyMessage="No bottles found." />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selectedBottle ? "Edit Bottle Type" : "Add Bottle Type"}</DialogTitle><DialogDescription>Manage bottle inventory</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Type</Label><Select value={formData.bottle_type} onValueChange={(v) => setFormData({...formData, bottle_type: v as BottleType})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="glass">Glass</SelectItem><SelectItem value="plastic">Plastic</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Size</Label><Select value={formData.size} onValueChange={(v) => setFormData({...formData, size: v as BottleSize})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="500ml">500ml</SelectItem><SelectItem value="1l">1 Liter</SelectItem><SelectItem value="2l">2 Liter</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Total Quantity</Label><Input type="number" value={formData.total_quantity} onChange={(e) => setFormData({...formData, total_quantity: e.target.value})} /></div>
              <div className="space-y-2"><Label>Deposit Amount (₹)</Label><Input type="number" value={formData.deposit_amount} onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetForm}>Cancel</Button><Button onClick={handleSubmit}>{selectedBottle ? "Update" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bottle Transaction</DialogTitle><DialogDescription>{selectedBottle && `${selectedBottle.bottle_type} ${selectedBottle.size} - Available: ${selectedBottle.available_quantity}`}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Transaction Type</Label><Select value={transactionData.type} onValueChange={(v) => setTransactionData({...transactionData, type: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="issued">Issue to Customer</SelectItem><SelectItem value="returned">Customer Return</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={transactionData.quantity} onChange={(e) => setTransactionData({...transactionData, quantity: e.target.value})} placeholder="Enter quantity" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>Cancel</Button><Button onClick={handleTransaction}>{transactionData.type === "issued" ? "Issue" : "Record Return"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
