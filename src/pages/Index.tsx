import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Shield, UserCircle } from "lucide-react";
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

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  year: number | null;
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
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
            onBack={() => setSelectedVehicleId(null)}
          />
        </div>
      </div>
    );
  }

  const pendingOrders = workOrders.filter(order => order.status === 'pending').length;
  const monthlyInvoices = workOrders.filter(order => {
    const orderDate = new Date(order.created_at);
    const currentDate = new Date();
    return orderDate.getMonth() === currentDate.getMonth() &&
           orderDate.getFullYear() === currentDate.getFullYear();
  }).length;
  const totalBilled = workOrders.reduce((acc, order) => acc + (order.total_cost || 0), 0);

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
          vehicles={vehicles.length}
          pendingOrders={pendingOrders}
          monthlyInvoices={monthlyInvoices}
          totalBilled={totalBilled}
        />

        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Vehículos en Taller
          </h2>
          <Button 
            className="flex items-center space-x-2"
            onClick={() => setShowVehicleForm(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Vehículo</span>
          </Button>
        </div>

        {showVehicleForm && (
          <div className="mb-6">
            <VehicleForm 
              onClose={() => setShowVehicleForm(false)}
              onSuccess={handleVehicleAdded}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle, index) => (
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
      </motion.div>
    </div>
  );
};

export default Index;
