import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Eye, Edit, Trash2, Milk, Filter, Download } from "lucide-react";
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
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Column, Action } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import type { Cattle, CattleStatus, LactationStatus, CattleType } from "@shared/types";

// Sample data
const sampleCattle: Cattle[] = [
  {
    id: "1",
    tag_number: "AW-001",
    name: "Lakshmi",
    breed: "Gir",
    cattle_type: "cow",
    date_of_birth: "2020-03-15",
    status: "active",
    lactation_status: "lactating",
    weight: 450,
    lactation_number: 3,
    created_at: "2024-01-01",
  },
  {
    id: "2",
    tag_number: "AW-002",
    name: "Kamdhenu",
    breed: "Sahiwal",
    cattle_type: "cow",
    date_of_birth: "2019-06-20",
    status: "active",
    lactation_status: "pregnant",
    weight: 480,
    lactation_number: 4,
    expected_calving_date: "2024-04-15",
    created_at: "2024-01-01",
  },
  {
    id: "3",
    tag_number: "AW-003",
    name: "Nandi",
    breed: "Murrah",
    cattle_type: "buffalo",
    date_of_birth: "2021-01-10",
    status: "active",
    lactation_status: "lactating",
    weight: 550,
    lactation_number: 2,
    created_at: "2024-01-01",
  },
  {
    id: "4",
    tag_number: "AW-004",
    name: "Gauri",
    breed: "HF Cross",
    cattle_type: "cow",
    date_of_birth: "2022-08-05",
    status: "active",
    lactation_status: "dry",
    weight: 420,
    lactation_number: 1,
    created_at: "2024-01-01",
  },
  {
    id: "5",
    tag_number: "AW-005",
    name: "Sundari",
    breed: "Jersey",
    cattle_type: "cow",
    date_of_birth: "2018-11-25",
    status: "sold",
    lactation_status: "dry",
    weight: 400,
    lactation_number: 5,
    created_at: "2024-01-01",
  },
];

const breeds = ["Gir", "Sahiwal", "HF Cross", "Jersey", "Murrah", "Mehsana", "Jaffarabadi", "Red Sindhi", "Tharparkar"];

export default function CattlePage() {
  const [cattle, setCattle] = useState<Cattle[]>(sampleCattle);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCattle, setSelectedCattle] = useState<Cattle | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    tag_number: "",
    name: "",
    breed: "",
    cattle_type: "cow" as CattleType,
    date_of_birth: "",
    weight: "",
    notes: "",
  });

  const filteredCattle = filterStatus === "all" 
    ? cattle 
    : cattle.filter(c => c.status === filterStatus);

  const stats = {
    total: cattle.length,
    active: cattle.filter((c) => c.status === "active").length,
    lactating: cattle.filter((c) => c.lactation_status === "lactating").length,
    pregnant: cattle.filter((c) => c.lactation_status === "pregnant").length,
    dry: cattle.filter((c) => c.lactation_status === "dry").length,
  };

  const columns: Column<Cattle>[] = [
    {
      key: "tag_number",
      header: "Tag #",
      sortable: true,
      render: (item) => (
        <span className="font-mono font-medium text-primary">{item.tag_number}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (item) => <span className="font-medium">{item.name || "-"}</span>,
    },
    {
      key: "breed",
      header: "Breed",
      sortable: true,
    },
    {
      key: "cattle_type",
      header: "Type",
      render: (item) => (
        <Badge variant="outline" className="capitalize">
          {item.cattle_type}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} type="cattle" />,
    },
    {
      key: "lactation_status",
      header: "Lactation",
      render: (item) => <StatusBadge status={item.lactation_status} type="lactation" />,
    },
    {
      key: "lactation_number",
      header: "Lact. No.",
      sortable: true,
      render: (item) => (
        <span className="text-center">{item.lactation_number}</span>
      ),
    },
    {
      key: "weight",
      header: "Weight (kg)",
      sortable: true,
      render: (item) => item.weight ? `${item.weight} kg` : "-",
    },
  ];

  const actions: Action<Cattle>[] = [
    {
      label: "View Details",
      onClick: (item) => {
        setSelectedCattle(item);
        setIsViewDialogOpen(true);
      },
      icon: Eye,
    },
    {
      label: "Edit",
      onClick: (item) => {
        setSelectedCattle(item);
        setFormData({
          tag_number: item.tag_number,
          name: item.name || "",
          breed: item.breed,
          cattle_type: item.cattle_type,
          date_of_birth: item.date_of_birth || "",
          weight: item.weight?.toString() || "",
          notes: item.notes || "",
        });
        setIsDialogOpen(true);
      },
      icon: Edit,
    },
    {
      label: "Record Milk",
      onClick: (item) => {
        toast({
          title: "Record Milk",
          description: `Recording milk for ${item.name || item.tag_number}`,
        });
      },
      icon: Milk,
    },
    {
      label: "Delete",
      onClick: (item) => {
        setCattle((prev) => prev.filter((c) => c.id !== item.id));
        toast({
          title: "Cattle Deleted",
          description: `${item.name || item.tag_number} has been removed`,
        });
      },
      icon: Trash2,
      variant: "destructive",
    },
  ];

  const handleSubmit = () => {
    if (!formData.tag_number || !formData.breed) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (selectedCattle) {
      // Update existing
      setCattle((prev) =>
        prev.map((c) =>
          c.id === selectedCattle.id
            ? {
                ...c,
                ...formData,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
              }
            : c
        )
      );
      toast({
        title: "Cattle Updated",
        description: `${formData.name || formData.tag_number} has been updated`,
      });
    } else {
      // Create new
      const newCattle: Cattle = {
        id: Date.now().toString(),
        tag_number: formData.tag_number,
        name: formData.name || undefined,
        breed: formData.breed,
        cattle_type: formData.cattle_type,
        date_of_birth: formData.date_of_birth || undefined,
        status: "active",
        lactation_status: "dry",
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        lactation_number: 0,
        notes: formData.notes || undefined,
        created_at: new Date().toISOString(),
      };
      setCattle((prev) => [...prev, newCattle]);
      toast({
        title: "Cattle Added",
        description: `${formData.name || formData.tag_number} has been added to the herd`,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      tag_number: "",
      name: "",
      breed: "",
      cattle_type: "cow",
      date_of_birth: "",
      weight: "",
      notes: "",
    });
    setSelectedCattle(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Cattle Management"
        description="Manage your dairy herd and track cattle information"
        action={{
          label: "Add Cattle",
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
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card className="hover-elevate cursor-pointer" onClick={() => setFilterStatus("all")}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Cattle</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setFilterStatus("active")}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Lactating</p>
            <p className="text-2xl font-bold text-blue-600">{stats.lactating}</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pregnant</p>
            <p className="text-2xl font-bold text-purple-600">{stats.pregnant}</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Dry</p>
            <p className="text-2xl font-bold text-amber-600">{stats.dry}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="deceased">Deceased</SelectItem>
            <SelectItem value="dry">Dry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataTable
          data={filteredCattle}
          columns={columns}
          actions={actions}
          searchKey="tag_number"
          searchPlaceholder="Search by tag number..."
          emptyMessage="No cattle found. Add your first cattle to get started."
        />
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCattle ? "Edit Cattle" : "Add New Cattle"}
            </DialogTitle>
            <DialogDescription>
              {selectedCattle
                ? "Update the cattle information"
                : "Enter the details of the new cattle"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tag_number">Tag Number *</Label>
                <Input
                  id="tag_number"
                  placeholder="e.g., AW-006"
                  value={formData.tag_number}
                  onChange={(e) =>
                    setFormData({ ...formData, tag_number: e.target.value })
                  }
                  data-testid="input-tag-number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Lakshmi"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  data-testid="input-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="breed">Breed *</Label>
                <Select
                  value={formData.breed}
                  onValueChange={(value) =>
                    setFormData({ ...formData, breed: value })
                  }
                >
                  <SelectTrigger data-testid="select-breed">
                    <SelectValue placeholder="Select breed" />
                  </SelectTrigger>
                  <SelectContent>
                    {breeds.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cattle_type">Type *</Label>
                <Select
                  value={formData.cattle_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cattle_type: value as CattleType })
                  }
                >
                  <SelectTrigger data-testid="select-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cow">Cow</SelectItem>
                    <SelectItem value="buffalo">Buffalo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                  data-testid="input-dob"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g., 450"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  data-testid="input-weight"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                data-testid="input-notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} data-testid="button-submit-cattle">
              {selectedCattle ? "Update" : "Add"} Cattle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cattle Details</DialogTitle>
          </DialogHeader>

          {selectedCattle && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Milk className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedCattle.name || selectedCattle.tag_number}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedCattle.tag_number} • {selectedCattle.breed}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={selectedCattle.status} type="cattle" />
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Lactation</p>
                  <StatusBadge status={selectedCattle.lactation_status} type="lactation" />
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedCattle.cattle_type}</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{selectedCattle.weight || "-"} kg</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Lactation #</p>
                  <p className="font-medium">{selectedCattle.lactation_number}</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-muted-foreground">DOB</p>
                  <p className="font-medium">{selectedCattle.date_of_birth || "-"}</p>
                </div>
              </div>

              {selectedCattle.notes && (
                <div className="p-3 rounded-lg border">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{selectedCattle.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
