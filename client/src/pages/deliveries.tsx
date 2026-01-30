import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Calendar, 
  Truck, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  Phone, 
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { useDeliveries, useCustomers, useRoutes } from "@/hooks/useData";
import type { Delivery, DeliveryStatus } from "@shared/types";

interface DeliveryWithCustomer extends Delivery {
  customerName: string;
  customerPhone: string;
  customerArea: string;
  items: { product: string; quantity: number; price: number }[];
}

const sampleDeliveries: DeliveryWithCustomer[] = [
  {
    id: "1",
    customer_id: "1",
    customerName: "Sharma Family",
    customerPhone: "9876543210",
    customerArea: "Sector 12",
    delivery_date: "2024-01-30",
    status: "pending",
    created_at: "2024-01-30",
    items: [
      { product: "Full Cream Milk", quantity: 2, price: 65 },
      { product: "Dahi", quantity: 0.5, price: 60 },
    ],
  },
  {
    id: "2",
    customer_id: "2",
    customerName: "Gupta Residence",
    customerPhone: "9876543211",
    customerArea: "Model Town",
    delivery_date: "2024-01-30",
    status: "delivered",
    delivery_time: "2024-01-30T06:30:00",
    created_at: "2024-01-30",
    items: [{ product: "Toned Milk", quantity: 1.5, price: 55 }],
  },
  {
    id: "3",
    customer_id: "3",
    customerName: "Singh House",
    customerPhone: "9876543212",
    customerArea: "Civil Lines",
    delivery_date: "2024-01-30",
    status: "pending",
    created_at: "2024-01-30",
    items: [
      { product: "Buffalo Milk", quantity: 3, price: 80 },
      { product: "Paneer", quantity: 0.25, price: 350 },
    ],
  },
  {
    id: "4",
    customer_id: "4",
    customerName: "Verma Dairy Store",
    customerPhone: "9876543213",
    customerArea: "Main Market",
    delivery_date: "2024-01-30",
    status: "delivered",
    delivery_time: "2024-01-30T05:45:00",
    created_at: "2024-01-30",
    items: [
      { product: "Full Cream Milk", quantity: 10, price: 65 },
      { product: "Toned Milk", quantity: 5, price: 55 },
    ],
  },
  {
    id: "5",
    customer_id: "5",
    customerName: "Patel Family",
    customerPhone: "9876543214",
    customerArea: "Sector 12",
    delivery_date: "2024-01-30",
    status: "missed",
    notes: "Customer not available",
    created_at: "2024-01-30",
    items: [{ product: "Full Cream Milk", quantity: 1, price: 65 }],
  },
];

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryWithCustomer[]>(sampleDeliveries);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterArea, setFilterArea] = useState<string>("all");
  const { toast } = useToast();

  const areas = [...new Set(deliveries.map((d) => d.customerArea))];

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    const matchesArea = filterArea === "all" || d.customerArea === filterArea;
    return matchesStatus && matchesArea;
  });

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter((d) => d.status === "pending").length,
    delivered: deliveries.filter((d) => d.status === "delivered").length,
    missed: deliveries.filter((d) => d.status === "missed").length,
  };

  const updateStatus = (id: string, status: DeliveryStatus) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              delivery_time: status === "delivered" ? new Date().toISOString() : d.delivery_time,
            }
          : d
      )
    );
    toast({
      title: "Status Updated",
      description: `Delivery marked as ${status}`,
    });
  };

  const markAllDelivered = () => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.status === "pending"
          ? { ...d, status: "delivered" as DeliveryStatus, delivery_time: new Date().toISOString() }
          : d
      )
    );
    toast({
      title: "All Delivered",
      description: "All pending deliveries marked as delivered",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Deliveries"
        description="Manage daily customer deliveries"
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button onClick={markAllDelivered} data-testid="button-mark-all">
          <Check className="h-4 w-4 mr-2" />
          Mark All Delivered
        </Button>
      </PageHeader>

      {/* Date and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
            data-testid="input-delivery-date"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-[150px]" data-testid="select-area-filter">
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="hover-elevate cursor-pointer" onClick={() => setFilterStatus("all")}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setFilterStatus("pending")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setFilterStatus("delivered")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Delivered</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setFilterStatus("missed")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Missed</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.missed}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delivery Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4"
      >
        {filteredDeliveries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground">No deliveries found for the selected filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredDeliveries.map((delivery) => (
            <Card key={delivery.id} className="hover-elevate" data-testid={`delivery-${delivery.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Customer Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {delivery.customerName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{delivery.customerName}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {delivery.customerPhone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {delivery.customerArea}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {delivery.items.map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {item.product}: {item.quantity} × ₹{item.price}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm font-medium mt-1 text-primary">
                      Total: ₹
                      {delivery.items
                        .reduce((sum, item) => sum + item.quantity * item.price, 0)
                        .toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center gap-3">
                    <StatusBadge status={delivery.status} type="delivery" />
                    
                    {delivery.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => updateStatus(delivery.id, "delivered")}
                          data-testid={`button-deliver-${delivery.id}`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => updateStatus(delivery.id, "missed")}
                          data-testid={`button-miss-${delivery.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {delivery.delivery_time && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(delivery.delivery_time), "hh:mm a")}
                      </span>
                    )}
                  </div>
                </div>

                {delivery.notes && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    {delivery.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
    </div>
  );
}
