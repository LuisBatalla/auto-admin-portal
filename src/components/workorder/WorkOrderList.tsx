
import { WorkOrderCard } from "./WorkOrderCard";

interface WorkOrder {
  id: string;
  description: string;
  status: string;
  total_cost: number | null;
  created_at: string;
  completed_at: string | null;
}

interface WorkOrderListProps {
  workOrders: WorkOrder[];
  onStatusUpdate: () => void;
  onArchiveVehicle?: () => void;
  showArchiveButton?: boolean;
}

export const WorkOrderList = ({ 
  workOrders,
  onStatusUpdate,
  onArchiveVehicle,
  showArchiveButton = false
}: WorkOrderListProps) => {
  if (workOrders.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No hay órdenes de trabajo para este vehículo</p>
      </div>
    );
  }

  // Ordenar por fecha de creación (más reciente primero)
  const sortedOrders = [...workOrders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Encontrar la última orden completada (si existe)
  const lastCompletedOrder = sortedOrders.find(order => order.status === "completed");
  
  return (
    <div>
      {sortedOrders.map((order) => (
        <WorkOrderCard
          key={order.id}
          order={order}
          onStatusUpdate={onStatusUpdate}
          isLastCompleted={lastCompletedOrder?.id === order.id}
          onArchiveVehicle={onArchiveVehicle}
          showArchiveButton={showArchiveButton && lastCompletedOrder?.id === order.id}
        />
      ))}
    </div>
  );
};
