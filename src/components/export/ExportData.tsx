
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  year: number | null;
  archived?: boolean;
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

interface ExportDataProps {
  vehicles: Vehicle[];
  workOrders: WorkOrder[];
  onClose: () => void;
}

export const ExportData = ({ vehicles, workOrders, onClose }: ExportDataProps) => {
  const [exportVehicles, setExportVehicles] = useState(true);
  const [exportWorkOrders, setExportWorkOrders] = useState(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const { toast } = useToast();

  const prepareVehiclesCsv = () => {
    const headers = ['ID', 'Marca', 'Modelo', 'Placa', 'Año', 'Archivado'];
    const rows = vehicles.map(v => [
      v.id,
      v.brand,
      v.model,
      v.plate,
      v.year || '',
      v.archived ? 'Sí' : 'No'
    ]);
    return [headers, ...rows];
  };

  const prepareWorkOrdersCsv = () => {
    const headers = ['ID', 'ID Vehículo', 'Descripción', 'Estado', 'Costo Total', 'Fecha Creación', 'Fecha Completado'];
    const rows = workOrders.map(wo => {
      const vehicle = vehicles.find(v => v.id === wo.vehicle_id);
      const vehicleInfo = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` : wo.vehicle_id;
      
      return [
        wo.id,
        vehicleInfo,
        wo.description,
        translateStatus(wo.status),
        wo.total_cost || '0',
        formatDate(wo.created_at),
        wo.completed_at ? formatDate(wo.completed_at) : ''
      ];
    });
    return [headers, ...rows];
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  const convertToCSV = (data: any[][]) => {
    return data.map(row => 
      row.map(cell => {
        // Si la celda contiene comas, comillas o saltos de línea, la encerramos entre comillas
        const cellValue = String(cell);
        if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
          return `"${cellValue.replace(/"/g, '""')}"`;
        }
        return cellValue;
      }).join(',')
    ).join('\n');
  };

  const exportData = () => {
    try {
      let content = '';
      let filename = '';
      let type = '';

      if (exportFormat === 'csv') {
        type = 'text/csv;charset=utf-8;';
        
        if (exportVehicles && exportWorkOrders) {
          const vehiclesCsv = convertToCSV(prepareVehiclesCsv());
          const workOrdersCsv = convertToCSV(prepareWorkOrdersCsv());
          content = `VEHÍCULOS\n${vehiclesCsv}\n\nÓRDENES DE TRABAJO\n${workOrdersCsv}`;
          filename = 'taller_datos_completos.csv';
        } else if (exportVehicles) {
          content = convertToCSV(prepareVehiclesCsv());
          filename = 'taller_vehiculos.csv';
        } else if (exportWorkOrders) {
          content = convertToCSV(prepareWorkOrdersCsv());
          filename = 'taller_ordenes.csv';
        }
      } else if (exportFormat === 'json') {
        type = 'application/json;charset=utf-8;';
        const data: any = {};
        
        if (exportVehicles) {
          data.vehicles = vehicles;
        }
        
        if (exportWorkOrders) {
          data.workOrders = workOrders;
        }
        
        content = JSON.stringify(data, null, 2);
        filename = 'taller_datos.json';
      }

      if (!content) {
        toast({
          title: "Error",
          description: "Seleccione al menos un tipo de datos para exportar",
          variant: "destructive",
        });
        return;
      }

      // Crear un blob con los datos
      const blob = new Blob([content], { type });
      
      // Crear un link para descargar el archivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportación exitosa",
        description: `Los datos han sido exportados como ${filename}`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error al exportar datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Exportar Datos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Datos a exportar</h3>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="vehicles" 
                checked={exportVehicles} 
                onCheckedChange={(checked) => setExportVehicles(checked as boolean)} 
              />
              <label htmlFor="vehicles" className="text-sm">Vehículos ({vehicles.length})</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="workOrders" 
                checked={exportWorkOrders} 
                onCheckedChange={(checked) => setExportWorkOrders(checked as boolean)} 
              />
              <label htmlFor="workOrders" className="text-sm">Órdenes de trabajo ({workOrders.length})</label>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Formato</h3>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="csv" 
                  name="format" 
                  value="csv" 
                  checked={exportFormat === 'csv'} 
                  onChange={() => setExportFormat('csv')} 
                  className="h-4 w-4 text-primary" 
                />
                <label htmlFor="csv" className="text-sm">CSV</label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="json" 
                  name="format" 
                  value="json" 
                  checked={exportFormat === 'json'} 
                  onChange={() => setExportFormat('json')} 
                  className="h-4 w-4 text-primary" 
                />
                <label htmlFor="json" className="text-sm">JSON</label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={exportData} 
            disabled={!exportVehicles && !exportWorkOrders}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
