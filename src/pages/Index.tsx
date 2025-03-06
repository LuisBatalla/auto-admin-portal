import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Shield, UserCircle, FileDown } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { VehicleForm } from "@/components/VehicleForm";
import { VehicleDetails } from "@/components/VehicleDetails";
import { StatsSummary } from "@/components/dashboard/StatsSummary";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { ArchivedVehicleToggle } from "@/components/vehicle/ArchivedVehicleToggle";
import { ExportData } from "@/components/export/ExportData";

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

const Index = () => {
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const handleVehicleAdded = () => {
    setShowVehicleForm(false);
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    toast({
      title: "Vehículo agregado",
      description: "El vehículo ha sido agregado correctamente",
    });
  };

  const handleViewVehicleDetails = (id: string) => {
    setSelectedVehicleId(id);
  };

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');
      
      if (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
      }
      
      return data as Vehicle[];
    },
  });

  const { data: workOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['workOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*');
      
      if (error) {
        console.error('Error fetching work orders:', error);
        throw error;
      }
      
      return data as WorkOrder[];
    },
  });

  const getVehicleStatus = (vehicleId: string) => {
    const vehicleOrders = workOrders.filter(order => order.vehicle_id === vehicleId);
    
    if (vehicleOrders.length === 0) return 'Sin órdenes';
    
    const inProgressOrder = vehicleOrders.find(order => order.status === 'in_progress');
    if (inProgressOrder) return 'En progreso';
    
    const pendingOrder = vehicleOrders.find(order => order.status === 'pending');
    if (pendingOrder) return 'Pendiente';
    
    const completedOrder = vehicleOrders.find(order => order.status === 'completed');
    if (completedOrder) return 'Completado';
    
    return 'Sin estado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'En progreso':
        return 'bg-blue-100 text-blue-800';
      case 'Completado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (showArchived) {
      return Boolean(vehicle.archived) === true;
    } else {
      return Boolean(vehicle.archived) !== true;
    }
  });

  const activeVehicles = vehicles.filter(v => v.archived !== true).length;
  const pendingOrders = workOrders.filter(order => order.status === 'pending').length;
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyOrders = workOrders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  });
  
  const monthlyInvoices = monthlyOrders.length;
  
  const totalBilled = workOrders.reduce((acc, order) => acc + (order.total_cost || 0), 0);
  
  const monthlyBilled = monthlyOrders.reduce((acc, order) => acc + (order.total_cost || 0), 0);

  const ordersByStatus = {
    pending: workOrders.filter(order => order.status === 'pending').length,
    inProgress: workOrders.filter(order => order.status === 'in_progress').length,
    completed: workOrders.filter(order => order.status === 'completed').length,
    cancelled: workOrders.filter(order => order.status === 'cancelled').length
  };

  if (isLoadingVehicles || isLoadingOrders) {
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
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Taller Automotriz
            </h1>
            <p className="text-gray-600">Sistema de Gestión</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowExportModal(true)}
            >
              <FileDown className="h-4 w-4" />
              Exportar Datos
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {isAdmin ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <UserCircle className="h-4 w-4" />
                  )}
                  {user?.email}
                  {isAdmin && <span className="ml-2 text-xs text-primary">(Admin)</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <StatsSummary
          vehicles={activeVehicles}
          pendingOrders={pendingOrders}
          monthlyInvoices={monthlyInvoices}
          totalBilled={totalBilled}
          monthlyBilled={monthlyBilled}
          ordersByStatus={ordersByStatus}
        />

        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {showArchived ? 'Vehículos Archivados' : 'Vehículos en Taller'}
          </h2>
          <div className="flex space-x-2">
            <ArchivedVehicleToggle 
              showArchived={showArchived} 
              onToggle={() => setShowArchived(!showArchived)} 
            />
            
            {!showArchived && (
              <Button 
                className="flex items-center space-x-2"
                onClick={() => setShowVehicleForm(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Vehículo</span>
              </Button>
            )}
          </div>
        </div>

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
                onViewDetails={handleViewVehicleDetails}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Index;
