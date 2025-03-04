
import { WorkOrderCard } from "./WorkOrderCard";

interface WorkOrderListProps {
  workOrders: Array<{
    id: string;
    vehicle_id: string;
    description: string;
    status: string;
    total_cost: number | null;
    created_at: string;
    completed_at: string | null;
  }>;
  onStatusUpdate: () => void;
  onArchiveVehicle?: (vehicleId: string) => void;
  showArchiveButton?: boolean;
}

export const WorkOrderList = ({ 
  workOrders, 
  onStatusUpdate, 
  onArchiveVehicle,
  showArchiveButton = false
}: WorkOrderListProps) => {
  if (workOrders.length === 0) {
    return <p className="text-gray-500 italic">No hay órdenes registradas para este vehículo</p>;
  }

  return (
    <div className="space-y-4">
      {workOrders.map((order) => (
        <WorkOrderCard 
          key={order.id} 
          order={order} 
          onStatusUpdate={onStatusUpdate}
          onArchiveVehicle={onArchiveVehicle}
          showArchiveButton={showArchiveButton && order.status === "completed"}
        />
      ))}
    </div>
  );
};
