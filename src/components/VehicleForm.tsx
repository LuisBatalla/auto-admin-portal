
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

interface VehicleFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const VehicleForm = ({ onClose, onSuccess }: VehicleFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    plate: "",
    year: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('vehicles')
        .insert([
          {
            brand: formData.brand,
            model: formData.model,
            plate: formData.plate.toUpperCase(),
            year: formData.year ? parseInt(formData.year) : null,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Vehículo agregado",
        description: "El vehículo ha sido registrado exitosamente",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el vehículo. " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
      <h2 className="text-2xl font-bold mb-6">Agregar Nuevo Vehículo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="brand" className="block text-sm font-medium mb-1">
            Marca
          </label>
          <Input
            id="brand"
            required
            value={formData.brand}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-medium mb-1">
            Modelo
          </label>
          <Input
            id="model"
            required
            value={formData.model}
            onChange={(e) =>
              setFormData({ ...formData, model: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="plate" className="block text-sm font-medium mb-1">
            Placa
          </label>
          <Input
            id="plate"
            required
            value={formData.plate}
            onChange={(e) =>
              setFormData({ ...formData, plate: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium mb-1">
            Año
          </label>
          <Input
            id="year"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={(e) =>
              setFormData({ ...formData, year: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Agregando..." : "Agregar Vehículo"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
