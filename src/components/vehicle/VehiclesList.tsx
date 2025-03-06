
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VehicleCard } from "./VehicleCard";
import { ArchivedVehicleToggle } from "./ArchivedVehicleToggle";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  year: number | null;
  archived?: boolean;
}

interface VehiclesListProps {
  vehicles: Vehicle[];
  showArchived: boolean;
  getVehicleStatus: (vehicleId: string) => string;
  getStatusColor: (status: string) => string;
  onToggleArchived: () => void;
  onAddVehicle: () => void;
  onViewDetails: (id: string) => void;
}

export const VehiclesList = ({
  vehicles,
  showArchived,
  getVehicleStatus,
  getStatusColor,
  onToggleArchived,
  onAddVehicle,
  onViewDetails
}: VehiclesListProps) => {
  const filteredVehicles = vehicles.filter(vehicle => {
    if (showArchived) {
      return Boolean(vehicle.archived) === true;
    } else {
      return Boolean(vehicle.archived) !== true;
    }
  });

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          {showArchived ? 'Vehículos Archivados' : 'Vehículos en Taller'}
        </h2>
        <div className="flex space-x-2">
          <ArchivedVehicleToggle 
            showArchived={showArchived} 
            onToggle={onToggleArchived} 
          />
          
          {!showArchived && (
            <Button 
              className="flex items-center space-x-2"
              onClick={onAddVehicle}
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Vehículo</span>
            </Button>
          )}
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            {showArchived 
              ? "No hay vehículos archivados" 
              : "No hay vehículos activos en el taller"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              status={getVehicleStatus(vehicle.id)}
              statusColor={getStatusColor(getVehicleStatus(vehicle.id))}
              index={index}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </>
  );
};
