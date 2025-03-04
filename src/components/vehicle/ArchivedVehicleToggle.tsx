
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Archive, Eye } from "lucide-react";

interface ArchivedVehicleToggleProps {
  showArchived: boolean;
  onToggle: () => void;
}

export const ArchivedVehicleToggle = ({ 
  showArchived, 
  onToggle 
}: ArchivedVehicleToggleProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      {showArchived ? (
        <>
          <Eye className="h-4 w-4" />
          <span>Ver Activos</span>
        </>
      ) : (
        <>
          <Archive className="h-4 w-4" />
          <span>Ver Archivados</span>
        </>
      )}
    </Button>
  );
};
