import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CarFront,
  Wrench,
  FileText,
  UserCircle,
  Plus,
  LogOut,
  Shield,
} from "lucide-react";
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
  updated_at: string | null;
}

const Index = () => {
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const { user, isAdmin, userRole } = useAuth();
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

  const stats = [
    { 
      title: "Vehículos Activos", 
      value: vehicles.length.toString(), 
      icon: CarFront 
    },
    { 
      title: "Órdenes Pendientes", 
      value: workOrders.filter(order => order.status === 'pending').length.toString(), 
      icon: Wrench 
    },
    { 
      title: "Facturas del Mes", 
      value: workOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        const currentDate = new Date();
        return orderDate.getMonth() === currentDate.getMonth() &&
               orderDate.getFullYear() === currentDate.getFullYear();
      }).length.toString(), 
      icon: FileText 
    },
    { 
      title: "Total Facturado", 
      value: `$${workOrders.reduce((acc, order) => acc + (order.total_cost || 0), 0).toFixed(2)}`, 
      icon: UserCircle 
    },
  ];

  console.log("Estado de autenticación:", { user, isAdmin, userRole });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during logout:', error);
        toast({
          variant: "destructive",
          title: "Error al cerrar sesión",
          description: error.message,
        });
        return;
      }
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
      setTimeout(() => {
        navigate("/login");
      }, 100);
    } catch (error: any) {
      console.error('Error durante el cierre de sesión:', error);
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: error.message,
      });
    }
  };

  const handleAddVehicle = () => {
    setShowVehicleForm(true);
  };

  const handleVehicleAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  };

  const handleViewVehicleDetails = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };

  const getVehicleStatus = (vehicleId: string) => {
    const vehicleOrders = workOrders.filter(order => order.vehicle_id === vehicleId);
    
    if (vehicleOrders.length === 0) return 'Sin órdenes';
    
    // Buscar órdenes en progreso primero
    const inProgressOrder = vehicleOrders.find(order => order.status === 'in_progress');
    if (inProgressOrder) return 'En progreso';
    
    // Luego buscar órdenes pendientes
    const pendingOrder = vehicleOrders.find(order => order.status === 'pending');
    if (pendingOrder) return 'Pendiente';
    
    // Si no hay pendientes ni en progreso, buscar completadas
    const completedOrder = vehicleOrders.find(order => order.status === 'completed');
    if (completedOrder) return 'Completado';
    
    // Si no hay ninguna de las anteriores
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Vehículos en Taller
          </h2>
          <Button 
            className="flex items-center space-x-2"
            onClick={handleAddVehicle}
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
            <motion.div
              key={vehicle.id}
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
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(getVehicleStatus(vehicle.id))}`}>
                    {getVehicleStatus(vehicle.id)}
                  </span>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewVehicleDetails(vehicle.id)}
                  >
                    Ver Detalles
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
