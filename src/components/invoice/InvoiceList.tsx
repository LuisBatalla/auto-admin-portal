
import { useState } from "react";
import { Invoice } from "@/hooks/use-invoice-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, ArchiveRestore, CarFront, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface InvoiceListProps {
  invoices: Invoice[];
  isLoading: boolean;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  showArchived: boolean;
  onToggleArchived: () => void;
  formatMonthYear: (monthStr: string) => string;
  availableMonths: { value: string; label: string }[];
  onViewDetails?: (id: string) => void;
}

export const InvoiceList = ({
  invoices,
  isLoading,
  selectedMonth,
  onMonthChange,
  showArchived,
  onToggleArchived,
  formatMonthYear,
  availableMonths,
  onViewDetails
}: InvoiceListProps) => {
  const { toast } = useToast();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoices(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv.id));
    }
  };

  const handleArchiveSelected = () => {
    // Esta funcionalidad se implementará con Supabase en el futuro
    toast({
      title: "Archivado",
      description: `${selectedInvoices.length} facturas han sido archivadas`,
    });
    setSelectedInvoices([]);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM yyyy", { locale: es });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold capitalize">
            {formatMonthYear(selectedMonth)}
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleArchived}
            className="whitespace-nowrap"
          >
            {showArchived ? (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Mostrar Activas
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Mostrar Archivadas
              </>
            )}
          </Button>
        </div>
      </div>

      {selectedInvoices.length > 0 && (
        <div className="flex justify-between items-center bg-muted p-2 rounded-lg">
          <p className="text-sm font-medium">
            {selectedInvoices.length} facturas seleccionadas
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleArchiveSelected}
            >
              <Archive className="h-4 w-4 mr-1" />
              Archivar Seleccionadas
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedInvoices([])}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">No hay facturas para este período</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedInvoices.length === invoices.length
                ? "Deseleccionar Todo"
                : "Seleccionar Todo"}
            </Button>
            <p className="text-sm text-gray-500">
              {invoices.length} facturas • 
              Total: ${invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
            </p>
          </div>
          
          {invoices.map(invoice => (
            <Card 
              key={invoice.id}
              className={`transition-colors ${
                selectedInvoices.includes(invoice.id) 
                  ? "border-primary bg-primary/5" 
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => handleSelectInvoice(invoice.id)}
                      className="mt-1"
                    />
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CarFront className="h-4 w-4 text-primary" />
                        <p className="font-medium">
                          {invoice.vehicleBrand} {invoice.vehicleModel}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {invoice.vehiclePlate}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-500">
                        {formatDate(invoice.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <p className="font-bold">${invoice.total.toFixed(2)}</p>
                    <Badge 
                      variant="outline" 
                      className={invoice.status === 'active' 
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                      }
                    >
                      {invoice.status === 'active' ? 'Activa' : 'Archivada'}
                    </Badge>
                  </div>
                </div>
                
                {onViewDetails && (
                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(invoice.workOrderId)}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
