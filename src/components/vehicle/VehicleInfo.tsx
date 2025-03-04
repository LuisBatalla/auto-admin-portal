
import { Car, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface VehicleInfoProps {
  vehicle: {
    brand: string;
    model: string;
    plate: string;
    year: number | null;
  };
}

export const VehicleInfo = ({ vehicle }: VehicleInfoProps) => {
  return (
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
  );
};
