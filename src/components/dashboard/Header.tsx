
import { Button } from "@/components/ui/button";
import { LogOut, Shield, UserCircle, FileDown, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface HeaderProps {
  onShowExport?: () => void;
  showExportButton?: boolean;
}

export const Header = ({ onShowExport, showExportButton = true }: HeaderProps) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
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
          asChild
        >
          <Link to="/invoices">
            <FileText className="h-4 w-4" />
            Facturas
          </Link>
        </Button>
        
        {showExportButton && onShowExport && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onShowExport}
          >
            <FileDown className="h-4 w-4" />
            Exportar Datos
          </Button>
        )}
        
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
  );
};
