
import { StatCard } from "./StatsCard";
import { CarFront, Wrench, FileText, DollarSign } from "lucide-react";

interface OrdersByStatus {
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

interface StatsSummaryProps {
  vehicles: number;
  pendingOrders: number;
  monthlyInvoices: number;
  totalBilled: number;
  monthlyBilled: number;
  ordersByStatus: OrdersByStatus;
}

export const StatsSummary = ({ 
  vehicles, 
  pendingOrders, 
  monthlyInvoices, 
  totalBilled,
  monthlyBilled,
  ordersByStatus
}: StatsSummaryProps) => {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });

  const stats = [
    { 
      title: "Vehículos Activos", 
      value: vehicles.toString(), 
      icon: CarFront,
      description: "Vehículos en el taller"
    },
    { 
      title: "Órdenes Pendientes", 
      value: pendingOrders.toString(), 
      icon: Wrench,
      description: `En progreso: ${ordersByStatus.inProgress}`
    },
    { 
      title: "Facturas del Mes", 
      value: monthlyInvoices.toString(), 
      icon: FileText,
      description: formatter.format(monthlyBilled)
    },
    { 
      title: "Total Facturado", 
      value: formatter.format(totalBilled), 
      icon: DollarSign,
      description: `Completadas: ${ordersByStatus.completed}`
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          index={index}
          description={stat.description}
        />
      ))}
    </div>
  );
};
