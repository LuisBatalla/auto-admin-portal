
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
import { useQuery } from "@tanstack/react-query";

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
}

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user?.id)
          .single();
        
        if (error) throw error;
        setIsAdmin(data?.role === 'admin');
      } catch (error: any) {
        console.error('Error checking admin role:', error.message);
      }
    };

    if (user) {
      checkAdminRole();
    }
  }, [user]);

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
    // TODO: Implementar formulario para agregar vehículo
    toast({
      title: "Próximamente",
      description: "La función de agregar vehículos estará disponible pronto",
    });
  };

  if (isLoadingVehicles || isLoadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
                  <span className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                    {workOrders.find(order => order.vehicle_id === vehicle.id)?.status || 'Sin órdenes'}
                  </span>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                  <Button size="sm">Actualizar</Button>
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
