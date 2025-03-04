
import { StatCard } from "./StatsCard";
import { CarFront, Wrench, FileText, UserCircle } from "luc

ide-react";

interface StatsSummaryProps {
  vehicles: number;
  pendingOrders: number;
  monthlyInvoices: number;
  totalBilled: number;
}

export const StatsSummary = ({ 
  vehicles, 
  pendingOrders, 
  monthlyInvoices, 
  totalBilled 
}: StatsSummaryProps) => {
  const stats = [
    { 
      title: "Vehículos Activos", 
      value: vehicles.toString(), 
      icon: CarFront 
    },
    { 
      title: "Órdenes Pendientes", 
      value: pendingOrders.toString(), 
      icon: Wrench 
    },
    { 
      title: "Facturas del Mes", 
      value: monthlyInvoices.toString(), 
      icon: FileText 
    },
    { 
      title: "Total Facturado", 
      value: `$${totalBilled.toFixed(2)}`, 
      icon: UserCircle 
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
        />
      ))}
    </div>
  );
};
