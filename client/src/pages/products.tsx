import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Package, Download, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/types";

const sampleProducts: Product[] = [
  { id: "1", name: "Full Cream Milk", description: "Fresh cow milk with full cream", base_price: 65, unit: "liter", tax_percentage: 0, is_active: true, created_at: "2024-01-01" },
  { id: "2", name: "Toned Milk", description: "Low fat toned milk", base_price: 55, unit: "liter", tax_percentage: 0, is_active: true, created_at: "2024-01-01" },
  { id: "3", name: "Buffalo Milk", description: "Rich buffalo milk", base_price: 80, unit: "liter", tax_percentage: 0, is_active: true, created_at: "2024-01-01" },
  { id: "4", name: "Paneer", description: "Fresh cottage cheese", base_price: 350, unit: "kg", tax_percentage: 5, is_active: true, created_at: "2024-01-01" },
  { id: "5", name: "Dahi (Curd)", description: "Fresh homemade curd", base_price: 60, unit: "kg", tax_percentage: 0, is_active: true, created_at: "2024-01-01" },
  { id: "6", name: "Ghee", description: "Pure desi ghee", base_price: 600, unit: "kg", tax_percentage: 5, is_active: true, created_at: "2024-01-01" },
  { id: "7", name: "Buttermilk", description: "Fresh chaas/lassi", base_price: 30, unit: "liter", tax_percentage: 0, is_active: false, created_at: "2024-01-01" },
];

const units = ["liter", "kg", "piece", "gram", "ml"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    unit: "liter",
    tax_percentage: "0",
    is_active: true,
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
  };

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Product",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-medium">{item.name}</span>
            {item.description && (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "base_price",
      header: "Price",
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-primary">
          ₹{item.base_price}/{item.unit}
        </span>
      ),
    },
    {
      key: "tax_percentage",
      header: "Tax",
      render: (item) => (
        <span>{item.tax_percentage}%</span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (item) => (
        <Badge variant={item.is_active ? "default" : "secondary"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const actions: Action<Product>[] = [
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedProduct(item);
        setFormData({
          name: item.name,
          description: item.description || "",
          base_price: item.base_price.toString(),
          unit: item.unit,
          tax_percentage: item.tax_percentage.toString(),
          is_active: item.is_active,
        });
        setIsDialogOpen(true);
      },
      icon: Edit,
    },
    {
      label: "Delete",
      onClick: (item) => {
        setProducts((prev) => prev.filter((p) => p.id !== item.id));
        toast({
          title: "Product Deleted",
          description: `${item.name} has been removed`,
        });
      },
      icon: Trash2,
      variant: "destructive",
    },
  ];

  const handleSubmit = () => {
    if (!formData.name || !formData.base_price) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id
            ? {
                ...p,
                ...formData,
                base_price: parseFloat(formData.base_price),
                tax_percentage: parseFloat(formData.tax_percentage),
              }
            : p
        )
      );
      toast({
        title: "Product Updated",
        description: `${formData.name} has been updated`,
      });
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description || undefined,
        base_price: parseFloat(formData.base_price),
        unit: formData.unit,
        tax_percentage: parseFloat(formData.tax_percentage),
        is_active: formData.is_active,
        created_at: new Date().toISOString(),
      };
      setProducts((prev) => [...prev, newProduct]);
      toast({
        title: "Product Added",
        description: `${formData.name} has been added`,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      base_price: "",
      unit: "liter",
      tax_percentage: "0",
      is_active: true,
    });
    setSelectedProduct(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Products"
        description="Manage your dairy products catalog"
        action={{
          label: "Add Product",
          onClick: () => {
            resetForm();
            setIsDialogOpen(true);
          },
        }}
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Products</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable
          data={products}
          columns={columns}
          actions={actions}
          searchKey="name"
          searchPlaceholder="Search products..."
          emptyMessage="No products found. Add your first product."
        />
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? "Update the product information"
                : "Enter the details of the new product"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Full Cream Milk"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                data-testid="input-product-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                data-testid="input-product-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Base Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 65"
                  value={formData.base_price}
                  onChange={(e) =>
                    setFormData({ ...formData, base_price: e.target.value })
                  }
                  data-testid="input-product-price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit: value })
                  }
                >
                  <SelectTrigger data-testid="select-unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax">Tax Percentage</Label>
              <Input
                id="tax"
                type="number"
                placeholder="e.g., 5"
                value={formData.tax_percentage}
                onChange={(e) =>
                  setFormData({ ...formData, tax_percentage: e.target.value })
                }
                data-testid="input-product-tax"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active Status</Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
                data-testid="switch-active"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} data-testid="button-submit-product">
              {selectedProduct ? "Update" : "Add"} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
