import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Wheat, AlertTriangle, Download, Edit, Trash2, Package } from "lucide-react";
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
import type { FeedInventory, FeedCategory } from "@shared/types";

const sampleInventory: FeedInventory[] = [
  { id: "1", name: "Green Fodder (Berseem)", category: "green_fodder", unit: "kg", current_stock: 2500, min_stock_level: 500, cost_per_unit: 5, supplier: "Local Farm", created_at: "2024-01-01" },
  { id: "2", name: "Dry Hay", category: "dry_fodder", unit: "kg", current_stock: 1800, min_stock_level: 300, cost_per_unit: 8, created_at: "2024-01-01" },
  { id: "3", name: "Cattle Feed Concentrate", category: "concentrate", unit: "kg", current_stock: 150, min_stock_level: 200, cost_per_unit: 35, supplier: "Amul Feeds", created_at: "2024-01-01" },
  { id: "4", name: "Mineral Mixture", category: "supplement", unit: "kg", current_stock: 25, min_stock_level: 10, cost_per_unit: 120, supplier: "Vet Supplies", created_at: "2024-01-01" },
  { id: "5", name: "Salt Licks", category: "supplement", unit: "piece", current_stock: 12, min_stock_level: 5, cost_per_unit: 80, created_at: "2024-01-01" },
];

const categoryLabels: Record<FeedCategory, string> = { green_fodder: "Green Fodder", dry_fodder: "Dry Fodder", concentrate: "Concentrate", supplement: "Supplement", medicine: "Medicine" };
const categoryColors: Record<FeedCategory, string> = { green_fodder: "bg-green-500/10 text-green-600", dry_fodder: "bg-amber-500/10 text-amber-600", concentrate: "bg-blue-500/10 text-blue-600", supplement: "bg-purple-500/10 text-purple-600", medicine: "bg-red-500/10 text-red-600" };

export default function InventoryPage() {
  const [inventory, setInventory] = useState<FeedInventory[]>(sampleInventory);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedInventory | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: "", category: "green_fodder" as FeedCategory, unit: "kg", current_stock: "", min_stock_level: "", cost_per_unit: "", supplier: "" });

  const lowStockItems = inventory.filter(i => i.current_stock <= i.min_stock_level);
  const totalValue = inventory.reduce((sum, i) => sum + (i.current_stock * (i.cost_per_unit || 0)), 0);

  const columns: Column<FeedInventory>[] = [
    { key: "name", header: "Item", sortable: true, render: (item) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="h-5 w-5 text-primary" /></div>
        <div><span className="font-medium">{item.name}</span>{item.supplier && <p className="text-xs text-muted-foreground">{item.supplier}</p>}</div>
      </div>
    ) },
    { key: "category", header: "Category", render: (item) => <Badge variant="secondary" className={categoryColors[item.category]}>{categoryLabels[item.category]}</Badge> },
    { key: "current_stock", header: "Stock", sortable: true, render: (item) => (
      <div className="w-32">
        <div className="flex justify-between text-sm mb-1"><span className={item.current_stock <= item.min_stock_level ? "text-red-600 font-medium" : ""}>{item.current_stock} {item.unit}</span><span className="text-muted-foreground">/ {item.min_stock_level}</span></div>
        <Progress value={Math.min(100, (item.current_stock / item.min_stock_level) * 100)} className={`h-2 ${item.current_stock <= item.min_stock_level ? "[&>div]:bg-red-500" : ""}`} />
      </div>
    ) },
    { key: "cost_per_unit", header: "Unit Cost", render: (item) => item.cost_per_unit ? `₹${item.cost_per_unit}` : "-" },
    { key: "value", header: "Total Value", render: (item) => `₹${(item.current_stock * (item.cost_per_unit || 0)).toLocaleString("en-IN")}` },
  ];

  const actions: Action<FeedInventory>[] = [
    { label: "Edit", onClick: (item) => { setSelectedItem(item); setFormData({ name: item.name, category: item.category, unit: item.unit, current_stock: item.current_stock.toString(), min_stock_level: item.min_stock_level.toString(), cost_per_unit: item.cost_per_unit?.toString() || "", supplier: item.supplier || "" }); setIsDialogOpen(true); }, icon: Edit },
    { label: "Delete", onClick: (item) => { setInventory(prev => prev.filter(i => i.id !== item.id)); toast({ title: "Item Deleted" }); }, icon: Trash2, variant: "destructive" },
  ];

  const handleSubmit = () => {
    if (!formData.name) { toast({ title: "Validation Error", description: "Please enter item name", variant: "destructive" }); return; }
    if (selectedItem) {
      setInventory(prev => prev.map(i => i.id === selectedItem.id ? { ...i, ...formData, current_stock: parseFloat(formData.current_stock) || 0, min_stock_level: parseFloat(formData.min_stock_level) || 0, cost_per_unit: formData.cost_per_unit ? parseFloat(formData.cost_per_unit) : undefined } : i));
      toast({ title: "Item Updated" });
    } else {
      const newItem: FeedInventory = { id: Date.now().toString(), ...formData, current_stock: parseFloat(formData.current_stock) || 0, min_stock_level: parseFloat(formData.min_stock_level) || 0, cost_per_unit: formData.cost_per_unit ? parseFloat(formData.cost_per_unit) : undefined, created_at: new Date().toISOString() };
      setInventory(prev => [...prev, newItem]);
      toast({ title: "Item Added" });
    }
    resetForm();
  };

  const resetForm = () => { setFormData({ name: "", category: "green_fodder", unit: "kg", current_stock: "", min_stock_level: "", cost_per_unit: "", supplier: "" }); setSelectedItem(null); setIsDialogOpen(false); };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Feed & Inventory" description="Manage feed stock and supplies" action={{ label: "Add Item", onClick: () => { resetForm(); setIsDialogOpen(true); } }}>
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
              <div className="flex flex-wrap gap-2">{lowStockItems.map(item => <Badge key={item.id} variant="outline" className="bg-white dark:bg-background">{item.name}: {item.current_stock} {item.unit}</Badge>)}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable data={inventory} columns={columns} actions={actions} searchKey="name" searchPlaceholder="Search inventory..." emptyMessage="No inventory items found." />
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selectedItem ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle><DialogDescription>Manage feed and supply inventory</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Item Name *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Green Fodder" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v as FeedCategory})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(categoryLabels).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Unit</Label><Select value={formData.unit} onValueChange={(v) => setFormData({...formData, unit: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="liter">liter</SelectItem><SelectItem value="piece">piece</SelectItem><SelectItem value="bag">bag</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Current Stock</Label><Input type="number" value={formData.current_stock} onChange={(e) => setFormData({...formData, current_stock: e.target.value})} /></div>
              <div className="space-y-2"><Label>Min Stock Level</Label><Input type="number" value={formData.min_stock_level} onChange={(e) => setFormData({...formData, min_stock_level: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cost per Unit (₹)</Label><Input type="number" value={formData.cost_per_unit} onChange={(e) => setFormData({...formData, cost_per_unit: e.target.value})} /></div>
              <div className="space-y-2"><Label>Supplier</Label><Input value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={resetForm}>Cancel</Button><Button onClick={handleSubmit}>{selectedItem ? "Update" : "Add"} Item</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
