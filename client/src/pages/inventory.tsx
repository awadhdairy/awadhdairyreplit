import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Download, Edit, Trash2, Package, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import type { InventoryItem } from "@shared/types";
import { useInventory, useAddInventory, useUpdateInventory, useDeleteInventory } from "@/hooks/useData";

// Categories might need to be adjusted if FeedCategory is strict
const categoryLabels: Record<string, string> = {
  feed: "Feed",
  medicine: "Medicine",
  equipment: "Equipment",
  green_fodder: "Green Fodder",
  dry_fodder: "Dry Fodder",
  concentrate: "Concentrate"
};

const categoryColors: Record<string, string> = {
  feed: "bg-green-500/10 text-green-600",
  medicine: "bg-red-500/10 text-red-600",
  equipment: "bg-blue-500/10 text-blue-600",
  green_fodder: "bg-emerald-500/10 text-emerald-600",
  dry_fodder: "bg-amber-500/10 text-amber-600",
  concentrate: "bg-purple-500/10 text-purple-600"
};

export default function InventoryPage() {
  const { data: inventoryData, isLoading } = useInventory();
  const addInventoryMutation = useAddInventory();
  const updateInventoryMutation = useUpdateInventory();
  const deleteInventoryMutation = useDeleteInventory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category: "feed",
    unit: "kg",
    quantity: "",
    min_stock_level: "",
    unit_price: "",
    supplier_name: ""
  });

  const inventory = inventoryData || [];
  const lowStockItems = inventory.filter(i => i.quantity <= i.min_stock_level);
  const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * (i.unit_price || 0)), 0);

  const columns: Column<InventoryItem>[] = [
    {
      key: "name", header: "Item", sortable: true, render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div>
          <div><span className="font-medium">{item.name}</span>{item.supplier_name && <p className="text-xs text-muted-foreground">{item.supplier_name}</p>}</div>
        </div>
      )
    },
    { key: "category", header: "Category", render: (item) => <Badge variant="secondary" className={categoryColors[item.category] || "bg-gray-100"}>{categoryLabels[item.category] || item.category}</Badge> },
    {
      key: "quantity", header: "Stock", sortable: true, render: (item) => (
        <div className="w-32">
          <div className="flex justify-between text-sm mb-1"><span className={item.quantity <= item.min_stock_level ? "text-red-600 font-medium" : ""}>{item.quantity} {item.unit}</span><span className="text-muted-foreground">/ {item.min_stock_level}</span></div>
          <Progress value={(item.quantity / (item.min_stock_level * 2)) * 100} className={`h-1.5 ${item.quantity <= item.min_stock_level ? "bg-red-100" : ""}`} indicatorClassName={item.quantity <= item.min_stock_level ? "bg-red-500" : "bg-primary"} />
        </div>
      )
    },
    { key: "unit_price", header: "Unit Cost", sortable: true, render: (item) => item.unit_price ? `₹${item.unit_price}` : '-' },
    { key: "value", header: "Total Value", render: (item) => item.unit_price ? <span className="font-medium">₹{(item.quantity * item.unit_price).toLocaleString("en-IN")}</span> : '-' }
  ];

  const actions: Action<InventoryItem>[] = [
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedItem(item);
        setFormData({
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: item.quantity.toString(),
          min_stock_level: item.min_stock_level.toString(),
          unit_price: item.unit_price ? item.unit_price.toString() : "",
          supplier_name: item.supplier_name || ""
        });
        setIsDialogOpen(true);
      },
      icon: Edit
    },
    {
      label: "Delete",
      onClick: (item) => {
        deleteInventoryMutation.mutate(item.id, {
          onSuccess: () => toast({ title: "Item Deleted", description: "Inventory item has been removed" }),
          onError: (error) => toast({ title: "Error Deleting Item", description: error.message, variant: "destructive" })
        });
      },
      icon: Trash2,
      variant: "destructive"
    },
  ];

  const handleSubmit = () => {
    if (!formData.name) { toast({ title: "Validation Error", description: "Please enter item name", variant: "destructive" }); return; }

    const payload = {
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      supplier_name: formData.supplier_name || undefined,
      quantity: parseFloat(formData.quantity) || 0,
      min_stock_level: parseFloat(formData.min_stock_level) || 0,
      unit_price: formData.unit_price ? parseFloat(formData.unit_price) : undefined
    };

    if (selectedItem) {
      updateInventoryMutation.mutate(
        { id: selectedItem.id, ...payload },
        {
          onSuccess: () => {
            toast({ title: "Item Updated" });
            resetForm();
          },
          onError: (error) => {
            toast({ title: "Error Updating Item", description: error.message, variant: "destructive" });
          }
        }
      );
    } else {
      addInventoryMutation.mutate(
        payload,
        {
          onSuccess: () => {
            toast({ title: "Item Added" });
            resetForm();
          },
          onError: (error) => {
            toast({ title: "Error Adding Item", description: error.message, variant: "destructive" });
          }
        }
      );
    }
  };

  const resetForm = () => { setFormData({ name: "", category: "feed", unit: "kg", quantity: "", min_stock_level: "", unit_price: "", supplier_name: "" }); setSelectedItem(null); setIsDialogOpen(false); };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSaving = addInventoryMutation.isPending || updateInventoryMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Inventory" description="Manage stock and supplies" action={{ label: "Add Item", onClick: () => { resetForm(); setIsDialogOpen(true); } }}>
        <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover-elevate"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Items</p><p className="text-2xl font-bold text-primary">{inventory.length}</p></CardContent></Card>
        <Card className="hover-elevate"><CardContent className="p-4"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /><p className="text-sm text-muted-foreground">Low Stock</p></div><p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p></CardContent></Card>
        <Card className="hover-elevate col-span-2"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Inventory Value</p><p className="text-2xl font-bold text-green-600">₹{totalValue.toLocaleString("en-IN")}</p></CardContent></Card>
      </motion.div>

      {lowStockItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-red-500" /><span className="font-medium text-red-600">Low Stock Alert</span></div>
              <div className="flex flex-wrap gap-2">{lowStockItems.map(item => <Badge key={item.id} variant="outline" className="bg-white dark:bg-background">{item.name}: {item.quantity} {item.unit}</Badge>)}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={inventory} columns={columns} actions={actions} searchKey="name" searchPlaceholder="Search inventory..." emptyMessage="No inventory items found." />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selectedItem ? "Edit Item" : "Add Item"}</DialogTitle><DialogDescription>Manage inventory details</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Item Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Green Fodder" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Unit</Label><Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="liter">liter</SelectItem><SelectItem value="pieces">pieces</SelectItem><SelectItem value="bags">bags</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Current Stock</Label><Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} /></div>
              <div className="space-y-2"><Label>Min Stock Level</Label><Input type="number" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cost per Unit (₹)</Label><Input type="number" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })} /></div>
              <div className="space-y-2"><Label>Supplier</Label><Input value={formData.supplier_name} onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{selectedItem ? "Update" : "Add"} Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
