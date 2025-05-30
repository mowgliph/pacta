import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Autenticación Requerida
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-gray-500">
            Necesitas iniciar sesión para realizar esta acción.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} className="btn-outline">
            Cancelar
          </Button>
          <Button onClick={handleLogin} className="btn-primary">
            Iniciar Sesión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
