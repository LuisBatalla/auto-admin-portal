
import { ChevronLeft, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleDetailsHeaderProps {
  onBack: () => void;
  onNewOrder: () => void;
}

export const VehicleDetailsHeader = ({ onBack, onNewOrder }: VehicleDetailsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button onClick={onBack} variant="outline" size="sm">
        <ChevronLeft className="mr-2 h-4 w-4" /> Volver
      </Button>
      <Button onClick={onNewOrder}>
        <Wrench className="mr-2 h-4 w-4" /> Nueva Orden
      </Button>
    </div>
  );
};
