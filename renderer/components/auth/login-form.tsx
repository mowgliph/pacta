"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../ui/form";
import { LoadingSpinner } from "../ui/loading-spinner";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

// Esquema de validación para el formulario de login
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Formato de correo inválido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida"),
  rememberMe: z.boolean().default(false),
});

// Tipo para los datos del formulario
type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Componente mejorado de formulario de login con validación y mejor experiencia
 */
export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  // Configurar formulario con react-hook-form y validación zod
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Manejar envío del formulario
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const success = await login(values.email, values.password, values.rememberMe);

      if (success) {
        // Mostrar mensaje de éxito con progreso de redirección
        toast.success("Inicio de sesión exitoso", {
          description: "Redirigiendo al Dashboard...",
          duration: 2000,
        });
        
        // Redirigir al dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        // Mostrar error general (no deberíamos llegar aquí normalmente)
        setAuthError("Ocurrió un error al iniciar sesión. Por favor, inténtelo de nuevo.");
      }
    } catch (error: any) {
      console.error("Error de login:", error);
      setAuthError(error.message || "Credenciales inválidas.");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar envío del formulario de recuperación
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryEmail.trim() || !recoveryEmail.includes('@')) {
      toast.error("Por favor, introduzca un correo electrónico válido");
      return;
    }
    
    setIsRecoveryLoading(true);
    
    try {
      // Simulación: En una implementación real, llamaríamos a un servicio
      // await window.Electron.auth.requestPasswordReset(recoveryEmail);
      
      // Simular un retraso para feedback visual
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Instrucciones enviadas", {
        description: "Revise su correo electrónico para restablecer su contraseña",
      });
      
      setIsRecoveryDialogOpen(false);
      setRecoveryEmail("");
    } catch (error) {
      toast.error("No se pudo procesar su solicitud", {
        description: "Por favor, contacte al administrador",
      });
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full space-y-6">
      {/* Error de autenticación */}
      {authError && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error de autenticación</p>
            <p className="text-sm">{authError}</p>
          </div>
        </div>
      )}
      
      {/* Formulario principal */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="correo@ejemplo.com"
                    type="email"
                    {...field}
                    disabled={isLoading}
                    autoComplete="email"
                    className="bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Contraseña</FormLabel>
                  <button
                    type="button"
                    onClick={() => setIsRecoveryDialogOpen(true)}
                    className="text-xs text-primary hover:text-primary/80 hover:underline"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="pr-10 bg-background"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={togglePasswordVisibility}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    id="remember-me"
                  />
                </FormControl>
                <label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Recordarme
                </label>
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            className="w-full bg-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner className="mr-2" />
                <span>Autenticando...</span>
              </div>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </Form>
      
      {/* Modal de recuperación de contraseña */}
      <Dialog open={isRecoveryDialogOpen} onOpenChange={setIsRecoveryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogDescription>
              Introduzca su correo electrónico para recibir instrucciones de recuperación.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleRecoverySubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Correo electrónico</Label>
              <Input
                id="recovery-email"
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={isRecoveryLoading}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRecoveryDialogOpen(false)}
                disabled={isRecoveryLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isRecoveryLoading}>
                {isRecoveryLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner className="mr-2" />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  "Enviar instrucciones"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 