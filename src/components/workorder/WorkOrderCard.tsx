
import { useState } from "react";
import { Clock, Archive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface WorkOrderCardProps {
  order: {
    id: string;
    vehicle_id: string;
    description: string;
    status: string;
    total_cost: number | null;
    created_at: string;
    completed_at: string | null;
  };
  onStatusUpdate: () => void;
  onArchiveVehicle?: (vehicleId: string) => void;
  showArchiveButton?: boolean;
}

export const WorkOrderCard = ({ 
  order, 
  onStatusUpdate, 
  onArchiveVehicle,
  showArchiveButton = false
}: WorkOrderCardProps) => {
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase.rpc('update_work_order_status', {
        p_order_id: orderId,
        p_status: newStatus
      });

      if (error) throw error;
      
      onStatusUpdate();
      toast({
        title: "Estado actualizado",
        description: "La orden ha sido actualizada exitosamente",
      });
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se pudo actualizar el estado: ${error.message || "Error desconocido"}`,
      });
    }
  };

  const handleArchiveVehicle = () => {
    if (onArchiveVehicle) {
      onArchiveVehicle(order.vehicle_id);
    }
  };

  return (
    <Card key={order.id} className="overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-500">
              {formatDate(order.created_at)}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status === "pending" && "Pendiente"}
            {order.status === "in_progress" && "En Progreso"}
            {order.status === "completed" && "Completado"}
            {order.status === "cancelled" && "Cancelado"}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="mb-2 font-medium">Descripción:</p>
        <p className="text-gray-700 mb-4">{order.description}</p>
        
        {order.total_cost !== null && (
          <div className="mb-4">
            <p className="font-medium">Costo Total:</p>
            <p className="text-gray-700">${order.total_cost.toFixed(2)}</p>
          </div>
        )}

        {order.completed_at && (
          <div className="mb-4">
            <p className="font-medium">Completado el:</p>
            <p className="text-gray-700">{formatDate(order.completed_at)}</p>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            {order.status === "pending" && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "in_progress")}
                >
                  Iniciar Trabajo
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "cancelled")}
                >
                  Cancelar
                </Button>
              </>
            )}
            {order.status === "in_progress" && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => updateOrderStatus(order.id, "completed")}
              >
                Marcar como Completado
              </Button>
            )}
          </div>
          
          {showArchiveButton && order.status === "completed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchiveVehicle}
              className="flex items-center"
            >
              <Archive className="h-4 w-4 mr-1" />
              Archivar Vehículo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
