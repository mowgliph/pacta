"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Supplement } from "@/types/supplement.types";

interface ViewSupplementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  supplement: Supplement;
}

export function ViewSupplementDialog({
  isOpen,
  onClose,
  supplement,
}: ViewSupplementDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplement.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Tipo de Cambio</h3>
            <p>{supplement.changeType}</p>
          </div>
          <div>
            <h3 className="font-medium">Descripción</h3>
            <p>{supplement.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
