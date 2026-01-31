import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Package, ArrowUpCircle, ArrowDownCircle, AlertCircle, Download, Edit, Loader2 } from "lucide-react";
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
import { useBottles, useAddBottle, useUpdateBottle, useAddBottleTransaction } from "@/hooks/useData";

export default function BottlesPage() {
  const { data: bottlesData, isLoading } = useBottles();
  const addBottleMutation = useAddBottle();
  const updateBottleMutation = useUpdateBottle();
  const addTransactionMutation = useAddBottleTransaction();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ bottle_type: "glass" as BottleType, size: "1l" as BottleSize, total_quantity: "", deposit_amount: "" });
  const [transactionData, setTransactionData] = useState({ type: "issued" as "issued" | "returned", quantity: "", customer: "" });

  const bottles = bottlesData || [];

  const stats = useMemo(() => {
    return {
      total: bottles.reduce((sum, b) => sum + (b.total_quantity || 0), 0),
      available: bottles.reduce((sum, b) => sum + (b.available_quantity || 0), 0),
      issued: bottles.reduce((sum, b) => sum + ((b.total_quantity || 0) - (b.available_quantity || 0)), 0),
      depositValue: bottles.reduce((sum, b) => sum + (((b.total_quantity || 0) - (b.available_quantity || 0)) * (b.deposit_amount || 0)), 0),
    };
  }, [bottles]);

  const columns: Column<Bottle>[] = [
    {
      key: "bottle_type", header: "Type", render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div>
          <div><span className="font-medium capitalize">{item.bottle_type}</span><p className="text-xs text-muted-foreground">{item.size}</p></div>
        </div>
      )
    },
    { key: "total_quantity", header: "Total", sortable: true },
    { key: "available_quantity", header: "Available", sortable: true, render: (item) => <span className={item.available_quantity < 20 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>{item.available_quantity}</span> },
    { key: "issued", header: "Issued", render: (item) => <span className="text-amber-600">{(item.total_quantity || 0) - (item.available_quantity || 0)}</span> },
    { key: "deposit_amount", header: "Deposit", render: (item) => `₹${item.deposit_amount}` },
    { key: "value", header: "Issued Value", render: (item) => <span className="font-medium text-primary">₹{(((item.total_quantity || 0) - (item.available_quantity || 0)) * (item.deposit_amount || 0)).toLocaleString("en-IN")}</span> },
  ];

  const actions: Action<Bottle>[] = [
    {
      label: "Issue/Return",
      onClick: (item) => {
        setSelectedBottle(item);
        setTransactionData({ type: "issued", quantity: "", customer: "" });
        setIsTransactionDialogOpen(true);
      },
      icon: ArrowUpCircle
    },
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedBottle(item);
        setFormData({
          bottle_type: item.bottle_type,
          size: item.size,
          total_quantity: item.total_quantity.toString(),
          deposit_amount: item.deposit_amount.toString()
        });
        setIsDialogOpen(true);
      },
      icon: Edit
    },
  ];

  const handleSubmit = () => {
    if (!formData.total_quantity || !formData.deposit_amount) { toast({ title: "Validation Error", description: "Please fill all fields", variant: "destructive" }); return; }

    const payload = {
      ...formData,
      total_quantity: parseInt(formData.total_quantity),
      deposit_amount: parseFloat(formData.deposit_amount),
      available_quantity: undefined // Server logic or manual calc? Usually manual for creates.
    };

    // Note: For updates, available_quantity adjustment logic is tricky. 
    // Usually we update total, and difference affects available. 
    // For simplicity here, we assume admin is correcting 'total' stock.
    // Ideally backend handles this logic or we prevent modifying total directly if it breaks consistency.
    // For now, let's just pass what we have.

    if (selectedBottle) {
      // Calculate new available quantity based on change in total
      const oldTotal = selectedBottle.total_quantity;
      const newTotal = parseInt(formData.total_quantity);
      const diff = newTotal - oldTotal;
      const newAvailable = selectedBottle.available_quantity + diff;

      updateBottleMutation.mutate({
        id: selectedBottle.id,
        ...payload,
        available_quantity: newAvailable
      }, {
        onSuccess: () => { toast({ title: "Bottle Updated" }); resetForm(); },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
      });
    } else {
      addBottleMutation.mutate({
        ...payload,
        available_quantity: payload.total_quantity // New bottles: all available
      }, {
        onSuccess: () => { toast({ title: "Bottle Added" }); resetForm(); },
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
      });
    }
  };

  const handleTransaction = () => {
    if (!selectedBottle || !transactionData.quantity) return;
    const qty = parseInt(transactionData.quantity);

    if (transactionData.type === "issued" && qty > selectedBottle.available_quantity) {
      toast({ title: "Error", description: "Not enough bottles available", variant: "destructive" });
      return;
    }

    // Backend trigger should ideally handle balance updates, but here we might need to manually update bottle + create transaction.
    // Since we don't have triggers, we'll update the bottle availability AND create transaction record.
    // Ideally use a single RPC or transaction. 
    // We will do: Create Transaction -> (onSuccess) Update Bottle.
    // Wait, useAddBottleTransaction in useData invalidates 'bottles'.
    // If backend doesn't update, frontend won't see change.
    // We must assume Backend or Client does it. 
    // In our simplified Supabase setup, likely no Triggers. 
    // So we should Update Bottle too. 

    // Actually, `useAddBottleTransaction` mutation in `useData.ts` only calls `api.bottleTransactions.create`.
    // It does NOT update the bottle count automatically unless there's a Postgres Trigger.
    // Let's assume for now we need to manually update the bottle count as well.
    // Note: Concurrency issues possible.

    const newAvailable = transactionData.type === "issued" ? selectedBottle.available_quantity - qty : selectedBottle.available_quantity + qty;
    const newTotal = selectedBottle.total_quantity; // Total doesn't change on issue/return usually? Wait.
    // If I issue a bottle, available drops. Total physical bottles (including with customers) remains same.
    // Correct.

    // We need to execute both.

    addTransactionMutation.mutate({
      bottle_id: selectedBottle.id,
      transaction_type: transactionData.type,
      quantity: qty,
      transaction_date: new Date().toISOString()
    }, {
      onSuccess: () => {
        // Now update bottle stock
        updateBottleMutation.mutate({
          id: selectedBottle.id,
          available_quantity: Math.min(newAvailable, newTotal) // Prevent overflowing total on return
        }, {
          onSuccess: () => {
            toast({ title: transactionData.type === "issued" ? "Bottles Issued" : "Bottles Returned", description: `${qty} bottles ${transactionData.type}` });
            setIsTransactionDialogOpen(false);
          }
        });
      },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });
  };

  const resetForm = () => { setFormData({ bottle_type: "glass", size: "1l", total_quantity: "", deposit_amount: "" }); setSelectedBottle(null); setIsDialogOpen(false); };

  const isSaving = addBottleMutation.isPending || updateBottleMutation.isPending || addTransactionMutation.isPending;

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

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
              <div className="space-y-2"><Label>Type</Label><Select value={formData.bottle_type} onValueChange={(v) => setFormData({ ...formData, bottle_type: v as BottleType })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="glass">Glass</SelectItem><SelectItem value="plastic">Plastic</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Size</Label><Select value={formData.size} onValueChange={(v) => setFormData({ ...formData, size: v as BottleSize })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="500ml">500ml</SelectItem><SelectItem value="1l">1 Liter</SelectItem><SelectItem value="2l">2 Liter</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Total Quantity</Label><Input type="number" value={formData.total_quantity} onChange={(e) => setFormData({ ...formData, total_quantity: e.target.value })} /></div>
              <div className="space-y-2"><Label>Deposit Amount (₹)</Label><Input type="number" value={formData.deposit_amount} onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button><Button onClick={handleSubmit} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{selectedBottle ? "Update" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bottle Transaction</DialogTitle><DialogDescription>{selectedBottle && `${selectedBottle.bottle_type} ${selectedBottle.size} - Available: ${selectedBottle.available_quantity}`}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Transaction Type</Label><Select value={transactionData.type} onValueChange={(v) => setTransactionData({ ...transactionData, type: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="issued">Issue to Customer</SelectItem><SelectItem value="returned">Customer Return</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={transactionData.quantity} onChange={(e) => setTransactionData({ ...transactionData, quantity: e.target.value })} placeholder="Enter quantity" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)} disabled={isSaving}>Cancel</Button><Button onClick={handleTransaction} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{transactionData.type === "issued" ? "Issue" : "Record Return"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
