
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Clock, Wrench, Car, Calendar } from "lucide-react";
import { WorkOrderForm } from "./WorkOrderForm";

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

  const fetchVehicleDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch vehicle details
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (vehicleError) throw vehicleError;
      setVehicle(vehicleData);

      // Fetch work orders for this vehicle
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
      const { error } = await supabase
        .from("work_orders")
        .update({
          status: newStatus,
          ...(newStatus === "completed" ? { completed_at: new Date().toISOString() } : {})
        })
        .eq("id", orderId);

      if (error) throw error;
      
      fetchVehicleDetails();
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
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" size="sm">
          <ChevronLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Button onClick={() => setShowOrderForm(true)}>
          <Wrench className="mr-2 h-4 w-4" /> Nueva Orden
        </Button>
      </div>

      {showOrderForm && (
        <WorkOrderForm
          vehicleId={vehicleId}
          onClose={() => setShowOrderForm(false)}
          onSuccess={handleOrderAdded}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="mr-2 h-5 w-5" />
            Detalles del Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Marca</p>
              <p className="font-medium">{vehicle.brand}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Modelo</p>
              <p className="font-medium">{vehicle.model}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Placa</p>
              <p className="font-medium">{vehicle.plate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Año</p>
              <p className="font-medium">{vehicle.year || "No especificado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Órdenes de Trabajo</h3>
        {workOrders.length === 0 ? (
          <p className="text-gray-500 italic">No hay órdenes registradas para este vehículo</p>
        ) : (
          <div className="space-y-4">
            {workOrders.map((order) => (
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

                  <div className="flex justify-end space-x-2 mt-4">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
