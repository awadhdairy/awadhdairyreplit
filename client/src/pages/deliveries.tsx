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
  AlertCircle,
  Loader2
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
import { useToast } from "@/hooks/use-toast";
import { useDeliveries, useUpdateDelivery } from "@/hooks/useData";
import type { Delivery, DeliveryStatus } from "@shared/types";

export default function DeliveriesPage() {
  const { data: deliveriesData, isLoading } = useDeliveries();
  const updateDeliveryMutation = useUpdateDelivery();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterArea, setFilterArea] = useState<string>("all");

  const deliveries = deliveriesData || [];

  // Get unique areas from deliveries for filter
  const areas = useMemo(() => {
    const areaSet = new Set<string>();
    deliveries.forEach(d => {
      if (d.customer?.area) areaSet.add(d.customer.area);
    });
    return Array.from(areaSet);
  }, [deliveries]);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      // Filter by date
      const dateMatch = d.delivery_date === selectedDate;
      if (!dateMatch) return false;

      const matchesStatus = filterStatus === "all" || d.status === filterStatus;
      const matchesArea = filterArea === "all" || d.customer?.area === filterArea;
      return matchesStatus && matchesArea;
    });
  }, [deliveries, selectedDate, filterStatus, filterArea]);

  const stats = useMemo(() => {
    // Stats for Selected Date
    const todaysDeliveries = deliveries.filter(d => d.delivery_date === selectedDate);
    return {
      total: todaysDeliveries.length,
      pending: todaysDeliveries.filter((d) => d.status === "pending").length,
      delivered: todaysDeliveries.filter((d) => d.status === "delivered").length,
      missed: todaysDeliveries.filter((d) => d.status === "missed").length,
    };
  }, [deliveries, selectedDate]);

  const updateStatus = (id: string, status: DeliveryStatus) => {
    const deliveryTime = status === "delivered" ? new Date().toISOString() : undefined;

    updateDeliveryMutation.mutate({
      id,
      status,
      delivery_time: deliveryTime
    }, {
      onSuccess: () => {
        toast({
          title: "Status Updated",
          description: `Delivery marked as ${status}`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const markAllDelivered = () => {
    // Get all pending deliveries for current view
    const pendingDeliveries = filteredDeliveries.filter(d => d.status === "pending");

    if (pendingDeliveries.length === 0) {
      toast({ title: "No Pending Deliveries", description: "All deliveries are already processed." });
      return;
    }

    // Process sequentially effectively (could be bulk API)
    // For now we just iterate. In real world, use a bulk update API.
    pendingDeliveries.forEach(d => {
      updateStatus(d.id, "delivered");
    });
  };

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

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
            <p className="text-sm text-muted-foreground">Total (Today)</p>
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
              <p className="text-muted-foreground">No deliveries found for {format(new Date(selectedDate), "dd MMM yyyy")}</p>
              <p className="text-xs text-muted-foreground mt-2">Adjust date or filters to see records</p>
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
                          {delivery.customer?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{delivery.customer?.name || "Unknown Customer"}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {delivery.customer?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {delivery.customer.phone}
                            </span>
                          )}
                          {delivery.customer?.area && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {delivery.customer.area}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {delivery.delivery_items?.map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {item.product?.name || "Item"}: {item.quantity} × ₹{item.unit_price}
                        </Badge>
                      ))}
                    </div>
                    {delivery.delivery_items && delivery.delivery_items.length > 0 && (
                      <p className="text-sm font-medium mt-1 text-primary">
                        Total: ₹
                        {delivery.delivery_items
                          .reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
                          .toLocaleString("en-IN")}
                      </p>
                    )}
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
                          disabled={updateDeliveryMutation.isPending}
                          data-testid={`button-deliver-${delivery.id}`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => updateStatus(delivery.id, "missed")}
                          disabled={updateDeliveryMutation.isPending}
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
