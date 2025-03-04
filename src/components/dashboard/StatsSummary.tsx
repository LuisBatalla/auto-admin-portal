
import { StatCard } from "./StatsCard";
import { CarFront, Wrench, FileText, DollarSign, ClipboardCheck, Clock, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsSummaryProps {
  vehicles: number;
  pendingOrders: number;
  monthlyInvoices: number;
  totalBilled: number;
  monthlyBilled: number;
  ordersByStatus: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

export const StatsSummary = ({ 
  vehicles, 
  pendingOrders, 
  monthlyInvoices, 
  totalBilled,
  monthlyBilled,
  ordersByStatus
}: StatsSummaryProps) => {
  const mainStats = [
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
      icon: DollarSign
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            index={index}
          />
        ))}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3">Desglose Detallado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado de órdenes */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-md font-medium mb-4 flex items-center">
                <ClipboardCheck className="mr-2 h-5 w-5 text-primary" />
                Estado de Órdenes de Trabajo
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pendientes</span>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <span className="font-medium">{ordersByStatus.pending}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">En Progreso</span>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                    <span className="font-medium">{ordersByStatus.inProgress}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completadas</span>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                    <span className="font-medium">{ordersByStatus.completed}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Canceladas</span>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <span className="font-medium">{ordersByStatus.cancelled}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Facturación */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-md font-medium mb-4 flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                Detalles de Facturación
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Facturado este mes</span>
                  <span className="font-medium">${monthlyBilled.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Promedio por orden</span>
                  <span className="font-medium">
                    ${ordersByStatus.completed > 0 
                      ? (totalBilled / ordersByStatus.completed).toFixed(2) 
                      : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de órdenes completadas</span>
                  <span className="font-medium">{ordersByStatus.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total facturado histórico</span>
                  <span className="font-medium">${totalBilled.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
