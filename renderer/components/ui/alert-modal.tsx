import React from "react";
import { useNavigate } from "react-router-dom";
import { IconAlertCircle, IconLogin } from "@tabler/icons-react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface AlertModalProps {
  title?: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
  cancelLabel?: string;
  type?: "warning" | "error" | "info" | "success" | "auth";
}

export function AlertModal({
  title,
  description,
  isOpen,
  onClose,
  onAction,
  actionLabel = "Aceptar",
  cancelLabel = "Cancelar",
  type = "info",
}: AlertModalProps) {
  const navigate = useNavigate();

  const navigateToLogin = () => {
    navigate("/login");
    onClose();
  };

  // Determinar contenido y apariencia según el tipo
  const getModalContent = () => {
    switch (type) {
      case "auth":
        return {
          title: title || "Inicio de sesión requerido",
          description:
            description ||
            "Debes iniciar sesión para acceder a esta funcionalidad",
          icon: <IconLogin className="h-6 w-6 text-blue-500" />,
          actionLabel: "Iniciar sesión",
          onAction: navigateToLogin,
        };
      case "warning":
        return {
          title: title || "Advertencia",
          description: description || "¿Estás seguro de que deseas continuar?",
          icon: <IconAlertCircle className="h-6 w-6 text-amber-500" />,
          actionLabel,
          onAction,
        };
      case "error":
        return {
          title: title || "Error",
          description: description || "Ha ocurrido un error.",
          icon: <IconAlertCircle className="h-6 w-6 text-red-500" />,
          actionLabel,
          onAction,
        };
      case "success":
        return {
          title: title || "Éxito",
          description: description || "La operación se completó con éxito.",
          icon: <IconAlertCircle className="h-6 w-6 text-success" />,
          actionLabel,
          onAction,
        };
      case "info":
      default:
        return {
          title: title || "Información",
          description: description || "Información importante.",
          icon: <IconAlertCircle className="h-6 w-6 text-accent" />,
          actionLabel,
          onAction,
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {modalContent.icon}
            <DialogTitle>{modalContent.title}</DialogTitle>
          </div>
          <DialogDescription>{modalContent.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          {type !== "auth" && (
            <Button variant="outline" onClick={onClose}>
              {cancelLabel}
            </Button>
          )}
          <Button onClick={modalContent.onAction || onClose}>
            {modalContent.actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
