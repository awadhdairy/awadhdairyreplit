import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { 
  CattleStatus, 
  LactationStatus, 
  DeliveryStatus, 
  PaymentStatus,
  AttendanceStatus,
  EquipmentStatus 
} from "@shared/types";

interface StatusBadgeProps {
  status: string;
  type?: "cattle" | "lactation" | "delivery" | "payment" | "attendance" | "equipment" | "default";
  className?: string;
}

const cattleStatusColors: Record<CattleStatus, string> = {
  active: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  sold: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  deceased: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  dry: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const lactationStatusColors: Record<LactationStatus, string> = {
  lactating: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  dry: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  pregnant: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  calving: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
};

const deliveryStatusColors: Record<DeliveryStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  delivered: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  missed: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  partial: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  partial: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  paid: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  overdue: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const attendanceStatusColors: Record<AttendanceStatus, string> = {
  present: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  absent: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  half_day: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  leave: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
};

const equipmentStatusColors: Record<EquipmentStatus, string> = {
  active: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  maintenance: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  retired: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

function getStatusColor(status: string, type: StatusBadgeProps["type"]) {
  switch (type) {
    case "cattle":
      return cattleStatusColors[status as CattleStatus] || "";
    case "lactation":
      return lactationStatusColors[status as LactationStatus] || "";
    case "delivery":
      return deliveryStatusColors[status as DeliveryStatus] || "";
    case "payment":
      return paymentStatusColors[status as PaymentStatus] || "";
    case "attendance":
      return attendanceStatusColors[status as AttendanceStatus] || "";
    case "equipment":
      return equipmentStatusColors[status as EquipmentStatus] || "";
    default:
      return "";
  }
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({ status, type = "default", className }: StatusBadgeProps) {
  const colorClass = getStatusColor(status, type);

  return (
    <Badge 
      variant="outline" 
      className={cn("border font-medium", colorClass, className)}
      data-testid={`status-badge-${status}`}
    >
      {formatStatus(status)}
    </Badge>
  );
}
