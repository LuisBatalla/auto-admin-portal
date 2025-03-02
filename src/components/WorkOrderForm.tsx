import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface WorkOrderFormProps {
  vehicleId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const WorkOrderForm = ({ vehicleId, onClose, onSuccess }: WorkOrderFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    description: "",
    totalCost: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para agregar órdenes de trabajo",
      });
      return;
    }
    
    setIsLoading(true);
    console.log("Intentando agregar orden para el vehículo:", vehicleId);
    console.log("Usuario actual:", user?.id, "Es admin:", isAdmin);

    try {
      // Insertar la orden de trabajo directamente
      // Las políticas RLS ya validarán si el usuario tiene permiso para este vehículo
      const { data, error } = await supabase
        .from('work_orders')
        .insert([
          {
            vehicle_id: vehicleId,
            description: formData.description,
            status: "pending",
            total_cost: formData.totalCost ? parseFloat(formData.totalCost) : null,
          }
        ])
        .select();

      if (error) {
        console.error("Error al insertar orden de trabajo:", error);
        throw error;
      }

      console.log("Orden agregada exitosamente:", data);
      
      toast({
        title: "Orden de trabajo creada",
        description: "La orden ha sido registrada exitosamente",
      });
      onSuccess();
    } catch (error: any) {
      console.error("Error completo:", error);
      
      let errorMessage = "Error desconocido";
      
      // Personalizar mensajes de error según el código
      if (error.code === "42501") {
        errorMessage = "No tienes permiso para agregar órdenes a este vehículo";
      } else if (error.code === "23503") {
        errorMessage = "El vehículo seleccionado no existe";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se pudo agregar la orden: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 relative mb-6">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      <h2 className="text-2xl font-bold mb-6">Nueva Orden de Trabajo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Descripción del Trabajo
          </label>
          <Textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Detalles del trabajo a realizar..."
          />
        </div>
        <div>
          <label htmlFor="totalCost" className="block text-sm font-medium mb-1">
            Costo Estimado (opcional)
          </label>
          <Input
            id="totalCost"
            type="number"
            step="0.01"
            min="0"
            value={formData.totalCost}
            onChange={(e) =>
              setFormData({ ...formData, totalCost: e.target.value })
            }
            placeholder="0.00"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creando..." : "Crear Orden"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
