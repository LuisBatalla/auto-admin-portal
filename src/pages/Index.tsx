
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { VehicleForm } from "@/components/VehicleForm";
import { VehicleDetails } from "@/components/VehicleDetails";
import { StatsSummary } from "@/components/dashboard/StatsSummary";
import { ExportData } from "@/components/export/ExportData";
import { Header } from "@/components/dashboard/Header";
import { VehiclesList } from "@/components/vehicle/VehiclesList";
import { useGarageData } from "@/hooks/use-garage-data";

const Index = () => {
  const { toast } = useToast();
  
  const {
    vehicles,
    workOrders,
    isLoading,
    showArchived,
    setShowArchived,
    showVehicleForm,
    setShowVehicleForm,
    selectedVehicleId,
    setSelectedVehicleId,
    showExportModal,
    setShowExportModal,
    getVehicleStatus,
    getStatusColor,
    stats,
    queryClient
  } = useGarageData();

  const handleVehicleAdded = () => {
    setShowVehicleForm(false);
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    toast({
      title: "Vehículo agregado",
      description: "El vehículo ha sido agregado correctamente",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedVehicleId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <VehicleDetails
            vehicleId={selectedVehicleId}
            onBack={() => {
              setSelectedVehicleId(null);
              queryClient.invalidateQueries({ queryKey: ['vehicles'] });
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <Header onShowExport={() => setShowExportModal(true)} />

        <StatsSummary
          vehicles={stats.activeVehicles}
          pendingOrders={stats.pendingOrders}
          monthlyInvoices={stats.monthlyInvoices}
          totalBilled={stats.totalBilled}
          monthlyBilled={stats.monthlyBilled}
          ordersByStatus={stats.ordersByStatus}
        />

        <VehiclesList
          vehicles={vehicles}
          showArchived={showArchived}
          getVehicleStatus={getVehicleStatus}
          getStatusColor={getStatusColor}
          onToggleArchived={() => setShowArchived(!showArchived)}
          onAddVehicle={() => setShowVehicleForm(true)}
          onViewDetails={(id) => setSelectedVehicleId(id)}
        />

        {showExportModal && (
          <ExportData 
            vehicles={vehicles} 
            workOrders={workOrders} 
            onClose={() => setShowExportModal(false)} 
          />
        )}

        {showVehicleForm && (
          <div className="mb-6">
            <VehicleForm 
              onClose={() => setShowVehicleForm(false)}
              onSuccess={handleVehicleAdded}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Index;
