
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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

export const useGarageData = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
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

  // Calculate statistics
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

  return {
    vehicles,
    workOrders,
    isLoading: isLoadingVehicles || isLoadingOrders,
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
    stats: {
      activeVehicles,
      pendingOrders,
      monthlyInvoices,
      totalBilled,
      monthlyBilled,
      ordersByStatus
    },
    queryClient
  };
};
