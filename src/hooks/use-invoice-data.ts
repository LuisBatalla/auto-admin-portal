
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface Invoice {
  id: string;
  workOrderId: string;
  vehicleId: string;
  total: number;
  status: "active" | "archived";
  month: string; // Cambiado a string para coincidir con la interfaz
  year: number;
  date: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
}

export const useInvoiceData = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showCleanedData, setShowCleanedData] = useState(false);
  const queryClient = useQueryClient();

  // Convertir work_orders en facturas
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', selectedMonth, showArchived, showCleanedData],
    queryFn: async () => {
      const [year, month] = selectedMonth.split('-').map(Number);
      
      const { data: workOrders, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          vehicles(brand, model, plate)
        `)
        .gte('created_at', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lt('created_at', month === 12 
          ? `${year + 1}-01-01` 
          : `${year}-${(month + 1).toString().padStart(2, '0')}-01`);
      
      if (error) {
        console.error('Error cargando ordenes de trabajo:', error);
        throw error;
      }
      
      // Convertir órdenes en facturas
      let invoicesData: Invoice[] = workOrders.map(order => ({
        id: order.id,
        workOrderId: order.id,
        vehicleId: order.vehicle_id,
        total: order.total_cost || 0,
        status: order.status === 'completed' ? 'active' : 'archived',
        month: String(new Date(order.created_at).getMonth() + 1), // Convertido a string
        year: new Date(order.created_at).getFullYear(),
        date: order.created_at,
        vehicleBrand: order.vehicles?.brand,
        vehicleModel: order.vehicles?.model,
        vehiclePlate: order.vehicles?.plate
      }));
      
      // Filtrar por archivados si es necesario
      if (!showArchived) {
        invoicesData = invoicesData.filter(inv => inv.status === 'active');
      }
      
      // Limpiar datos si está activado
      if (showCleanedData) {
        // Filtrar por trabajos completados y no archivados
        invoicesData = invoicesData.filter(inv => 
          inv.status === 'active' || (showArchived && inv.status === 'archived')
        );
      }
      
      return invoicesData;
    }
  });

  const cleanData = () => {
    setShowCleanedData(!showCleanedData);
    // Invalidar consulta para recargar los datos
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  // Calcular totales
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const completedCount = invoices.filter(inv => inv.status === 'active').length;
  const archivedCount = invoices.filter(inv => inv.status === 'archived').length;

  // Formatear la fecha actual para el título
  const formatMonthYear = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return format(date, "MMMM 'de' yyyy", { locale: es });
  };

  // Obtener lista de meses disponibles (últimos 12 meses)
  const getAvailableMonths = () => {
    const months = [];
    const current = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(current.getFullYear(), current.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = format(date, "MMMM yyyy", { locale: es });
      months.push({ value: monthStr, label });
    }
    
    return months;
  };

  return {
    invoices,
    isLoading,
    selectedMonth,
    setSelectedMonth,
    showArchived,
    setShowArchived,
    showCleanedData,
    setShowCleanedData,
    cleanData,
    formatMonthYear,
    getAvailableMonths,
    stats: {
      totalAmount,
      completedCount,
      archivedCount
    },
    queryClient
  };
};
