
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VehicleCardProps {
  vehicle: {
    id: string;
    brand: string;
    model: string;
    plate: string;
    year: number | null;
  };
  status: string;
  statusColor: string;
  index: number;
  onViewDetails: (id: string) => void;
}

export const VehicleCard = ({ 
  vehicle, 
  status, 
  statusColor, 
  index, 
  onViewDetails 
}: VehicleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-gray-600">{vehicle.plate}</p>
            {vehicle.year && (
              <p className="text-sm text-gray-500">Año: {vehicle.year}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${statusColor}`}>
            {status}
          </span>
        </div>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(vehicle.id)}
          >
            Ver Detalles
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
