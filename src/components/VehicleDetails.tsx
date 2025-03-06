import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Archive, ArchiveRestore } from "lucide-react";
import { WorkOrderForm } from "./WorkOrderForm";
import { VehicleInfo } from "./vehicle/VehicleInfo";
import { WorkOrderList } from "./workorder/WorkOrderList";
import { VehicleDetailsHeader } from "./vehicle/VehicleDetailsHeader";
import { useQueryClient } from "@tanstack/react-query";

interface VehicleDetailsProps {
  vehicleId: string;
  onBack: () => void;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  year: number | null;
  archived?: boolean;
  status?: string;
}

interface WorkOrder {
  id: string;
  vehicle_id: string;
  description: string;
  status: string;
  total_cost: number | null;
  created_at: string;
  completed_at: string | null;
}

export const VehicleDetails = ({ vehicleId, onBack }: VehicleDetailsProps) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchVehicleDetails = async () => {
    setIsLoading(true);
    try {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (vehicleError) throw vehicleError;
      setVehicle(vehicleData);

      const { data: ordersData, error: ordersError } = await supabase
        .from("work_orders")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      setWorkOrders(ordersData || []);
    } catch (error: any) {
      console.error("Error fetching vehicle details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se pudieron cargar los detalles: ${error.message || "Error desconocido"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicleId]);

  const handleOrderAdded = () => {
    setShowOrderForm(false);
    fetchVehicleDetails();
    toast({
      title: "Orden creada",
      description: "La orden de trabajo ha sido creada exitosamente",
    });
  };

  const toggleArchiveStatus = async () => {
    if (!vehicle) return;
    
    try {
      const newArchivedStatus = !vehicle.archived;
      
      const { error } = await supabase
        .from('vehicles')
        .update({ archived: newArchivedStatus })
        .eq('id', vehicle.id);
        
      if (error) throw error;
      
      setVehicle({ ...vehicle, archived: newArchivedStatus });
      
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      
      toast({
        title: newArchivedStatus ? "Vehículo archivado" : "Vehículo restaurado",
        description: newArchivedStatus 
          ? "El vehículo ha sido archivado correctamente" 
          : "El vehículo ha sido restaurado correctamente",
      });

      if (newArchivedStatus) {
        onBack();
      }
    } catch (error: any) {
      console.error("Error al cambiar estado de archivo:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se pudo cambiar el estado: ${error.message || "Error desconocido"}`,
      });
    }
  };

  const hasCompletedOrders = workOrders.some(order => order.status === "completed");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600">Vehículo no encontrado</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <VehicleDetailsHeader
          onBack={onBack}
          onNewOrder={() => setShowOrderForm(true)}
        />
        
        {hasCompletedOrders && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleArchiveStatus}
            className="flex items-center gap-2"
          >
            {vehicle.archived ? (
              <>
                <ArchiveRestore className="h-4 w-4" />
                <span>Restaurar</span>
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                <span>Archivar</span>
              </>
            )}
          </Button>
        )}
      </div>

      {showOrderForm && (
        <WorkOrderForm
          vehicleId={vehicleId}
          onClose={() => setShowOrderForm(false)}
          onSuccess={handleOrderAdded}
        />
      )}

      <VehicleInfo vehicle={vehicle} />

      <div>
        <h3 className="text-xl font-semibold mb-4">Órdenes de Trabajo</h3>
        <WorkOrderList 
          workOrders={workOrders} 
          onStatusUpdate={fetchVehicleDetails}
          onArchiveVehicle={toggleArchiveStatus}
          showArchiveButton={!vehicle.archived && hasCompletedOrders}
        />
      </div>
    </div>
  );
};
