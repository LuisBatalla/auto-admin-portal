
import { Button } from "@/components/ui/button";
import { Archive, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface ArchivedVehicleToggleProps {
  showArchived: boolean;
  onToggle: () => void;
}

export const ArchivedVehicleToggle = ({ 
  showArchived, 
  onToggle 
}: ArchivedVehicleToggleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
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
    </motion.div>
  );
};
