
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, PlayCircle, Archive } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface WorkOrder {
  id: string;
  description: string;
  status: string;
  total_cost: number | null;
  created_at: string;
  completed_at: string | null;
}

interface WorkOrderCardProps {
  order: WorkOrder;
  onStatusUpdate: () => void;
  isLastCompleted?: boolean;
  onArchiveVehicle?: () => void;
  showArchiveButton?: boolean;
}

export const WorkOrderCard = ({
  order,
  onStatusUpdate,
  isLastCompleted = false,
  onArchiveVehicle,
  showArchiveButton = false
}: WorkOrderCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            Pendiente
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            En Progreso
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
            Completado
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      // Usar la función RPC para actualizar con seguridad
      const { data, error } = await supabase.rpc('update_work_order_status', {
        p_order_id: order.id,
        p_status: newStatus
      });

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `La orden ha sido marcada como "${newStatus === 'completed' ? 'completada' : newStatus === 'in_progress' ? 'en progreso' : 'cancelada'}"`,
      });
      
      onStatusUpdate();
    } catch (error: any) {
      console.error("Error al actualizar estado:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se pudo actualizar el estado: ${error.message || "Error desconocido"}`,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm text-gray-500">
              <Clock className="h-3 w-3 inline mr-1" />
              {formatDate(order.created_at)}
            </p>
            {order.completed_at && (
              <p className="text-sm text-green-600">
                <CheckCircle className="h-3 w-3 inline mr-1" />
                Completado: {formatDate(order.completed_at)}
              </p>
            )}
          </div>
          <div>{getStatusBadge(order.status)}</div>
        </div>

        <div className="mb-2">
          <p className="whitespace-pre-wrap">{order.description}</p>
        </div>

        {order.total_cost !== null && (
          <div className="mb-3">
            <p className="font-semibold">
              Total: ${order.total_cost.toFixed(2)}
            </p>
          </div>
        )}

        {order.status !== "completed" && order.status !== "cancelled" && (
          <div className="flex justify-end gap-2 mt-2">
            {isAdmin && order.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="text-blue-600"
                disabled={isUpdating}
                onClick={() => updateOrderStatus("in_progress")}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Iniciar
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              className="text-green-600"
              disabled={isUpdating}
              onClick={() => updateOrderStatus("completed")}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Completar
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              disabled={isUpdating}
              onClick={() => updateOrderStatus("cancelled")}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
        )}
        
        {showArchiveButton && isLastCompleted && onArchiveVehicle && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Button
              size="sm"
              variant="outline"
              className="w-full text-gray-600"
              onClick={onArchiveVehicle}
            >
              <Archive className="h-4 w-4 mr-1" />
              Archivar Vehículo
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
