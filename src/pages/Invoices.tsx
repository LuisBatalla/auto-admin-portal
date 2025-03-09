
import { useState } from "react";
import { motion } from "framer-motion";
import { useInvoiceData } from "@/hooks/use-invoice-data";
import { InvoiceList } from "@/components/invoice/InvoiceList";
import { Header } from "@/components/dashboard/Header";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { FileText, DollarSign, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Invoices = () => {
  const navigate = useNavigate();
  const {
    invoices,
    isLoading,
    selectedMonth,
    setSelectedMonth,
    showArchived,
    setShowArchived,
    showCleanedData,
    cleanData,
    formatMonthYear,
    getAvailableMonths,
    stats
  } = useInvoiceData();
  
  const handleViewInvoiceDetails = (workOrderId: string) => {
    // Buscar el vehicleId asociado a esta workOrder
    const invoice = invoices.find(inv => inv.workOrderId === workOrderId);
    if (invoice) {
      navigate(`/vehicle/${invoice.vehicleId}`, { 
        state: { highlight: workOrderId } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <Header showExportButton={false} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Facturas del Mes
              </CardTitle>
              <CardDescription>
                {formatMonthYear(selectedMonth)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  {stats.completedCount + stats.archivedCount}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Total Facturado
              </CardTitle>
              <CardDescription>
                {formatMonthYear(selectedMonth)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  ${stats.totalAmount.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Facturas Archivadas
              </CardTitle>
              <CardDescription>
                {formatMonthYear(selectedMonth)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Archive className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  {stats.archivedCount}
                </div>
                {showCleanedData && (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                    Datos Limpios
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <InvoiceList
          invoices={invoices}
          isLoading={isLoading}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
          formatMonthYear={formatMonthYear}
          availableMonths={getAvailableMonths()}
          onViewDetails={handleViewInvoiceDetails}
          showCleanedData={showCleanedData}
          onCleanData={cleanData}
        />
      </motion.div>
    </div>
  );
};

export default Invoices;
