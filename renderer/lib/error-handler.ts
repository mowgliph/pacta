import { toast } from "sonner";

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const handleError = (error: unknown) => {
  console.error("Error:", error);

  if (error instanceof AppError) {
    toast.error(error.message, {
      description: `Código: ${error.code}`,
    });
    return;
  }

  if (error instanceof Error) {
    toast.error("Error inesperado", {
      description: error.message,
    });
    return;
  }

  toast.error("Error desconocido", {
    description: "Ocurrió un error inesperado",
  });
};

export const handleSuccess = (message: string) => {
  toast.success(message);
};

export const handleWarning = (message: string) => {
  toast.warning(message);
};

export const handleInfo = (message: string) => {
  toast.info(message);
};
