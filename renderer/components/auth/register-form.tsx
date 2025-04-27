"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { AlertCircle, CheckCircle2, Eye, EyeOff, Info } from "lucide-react";
import { Progress } from "../ui/progress";

// Esquema de validación con reglas de seguridad de contraseña
const registerSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Formato de correo inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Tipo para los datos del formulario
type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Evalúa la fortaleza de la contraseña
 * @param password Contraseña a evaluar
 * @returns Puntuación entre 0 y 100
 */
const evaluatePasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let score = 0;
  
  // Longitud básica
  const lengthScore = Math.min(password.length * 4, 40);
  score += lengthScore;
  
  // Complejidad
  if (/[A-Z]/.test(password)) score += 10;
  if (/[a-z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  
  // Variedad de caracteres (incentiva mezclar tipos)
  const variety = 
    (/[A-Z]/.test(password) ? 1 : 0) + 
    (/[a-z]/.test(password) ? 1 : 0) + 
    (/[0-9]/.test(password) ? 1 : 0) + 
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  
  score += variety * 5;
  
  return Math.min(score, 100);
};

/**
 * Obtiene el nivel de seguridad basado en la puntuación
 */
const getStrengthLevel = (score: number): {level: string; color: string} => {
  if (score < 30) return { level: "Muy débil", color: "text-destructive" };
  if (score < 50) return { level: "Débil", color: "text-amber-500" };
  if (score < 75) return { level: "Buena", color: "text-amber-400" };
  if (score < 90) return { level: "Fuerte", color: "text-emerald-400" };
  return { level: "Muy fuerte", color: "text-emerald-500" };
};

/**
 * Obtiene el color de la barra de progreso
 */
const getProgressColor = (score: number): string => {
  if (score < 30) return "bg-destructive";
  if (score < 50) return "bg-amber-500";
  if (score < 75) return "bg-amber-400";
  if (score < 90) return "bg-emerald-400";
  return "bg-emerald-500";
};

/**
 * Componente mejorado de formulario de registro con validación y feedback
 */
export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const router = useRouter();
  const { register } = useAuth();

  // Configurar formulario con react-hook-form y validación zod
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Validar al cambiar
  });

  // Manejar envío del formulario
  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // En una implementación real, llamaríamos al servicio de registro
      const success = await register(values.name, values.email, values.password);

      if (success) {
        // Mostrar mensaje de éxito
        toast.success("Registro exitoso", {
          description: "Su cuenta ha sido creada. Redirigiendo al inicio de sesión...",
          duration: 3000,
        });
        
        // Redirigir a login
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        // Mostrar error general
        setAuthError("Ocurrió un error al registrar su cuenta. Por favor, inténtelo de nuevo.");
      }
    } catch (error: any) {
      console.error("Error de registro:", error);
      setAuthError(error.message || "No se pudo completar el registro.");
    } finally {
      setIsLoading(false);
    }
  };

  // Evaluar fortaleza de la contraseña cuando cambia
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    form.setValue("password", password);
    setPasswordScore(evaluatePasswordStrength(password));
  };

  const strengthInfo = getStrengthLevel(passwordScore);

  return (
    <div className="w-full space-y-6">
      {/* Error de registro */}
      {authError && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error de registro</p>
            <p className="text-sm">{authError}</p>
          </div>
        </div>
      )}
      
      {/* Formulario principal */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese su nombre completo"
                    {...field}
                    disabled={isLoading}
                    autoComplete="name"
                    className="bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
              <FormItem className="space-y-3">
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      onChange={onPasswordChange}
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="pr-10 bg-background"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
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
                
                {/* Indicador de fortaleza de contraseña */}
                {field.value && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-xs flex items-center gap-1">
                        <span>Fortaleza:</span>
                        <span className={strengthInfo.color}>{strengthInfo.level}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {passwordScore < 75 ? "Mejore su contraseña" : "Contraseña segura"}
                      </div>
                    </div>
                    <Progress value={passwordScore} className="h-1" 
                      style={{
                        ["--progress-background" as any]: getProgressColor(passwordScore)
                      }}
                    />
                  </div>
                )}
                
                <FormMessage />
                
                {/* Requisitos de contraseña */}
                <div className="bg-muted/40 rounded-md p-3 space-y-2">
                  <div className="text-xs font-medium flex items-center">
                    <Info className="h-3.5 w-3.5 mr-1.5" />
                    Requisitos de contraseña:
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                    <li className="flex items-center gap-1">
                      {field.value && field.value.length >= 8 
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                        : <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                      <span className={field.value && field.value.length >= 8 ? "text-foreground" : "text-muted-foreground"}>
                        Mínimo 8 caracteres
                      </span>
                    </li>
                    <li className="flex items-center gap-1">
                      {field.value && /[A-Z]/.test(field.value) 
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                        : <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                      <span className={field.value && /[A-Z]/.test(field.value) ? "text-foreground" : "text-muted-foreground"}>
                        Al menos una mayúscula
                      </span>
                    </li>
                    <li className="flex items-center gap-1">
                      {field.value && /[a-z]/.test(field.value) 
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                        : <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                      <span className={field.value && /[a-z]/.test(field.value) ? "text-foreground" : "text-muted-foreground"}>
                        Al menos una minúscula
                      </span>
                    </li>
                    <li className="flex items-center gap-1">
                      {field.value && /[0-9]/.test(field.value) 
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                        : <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                      <span className={field.value && /[0-9]/.test(field.value) ? "text-foreground" : "text-muted-foreground"}>
                        Al menos un número
                      </span>
                    </li>
                    <li className="flex items-center gap-1">
                      {field.value && /[^A-Za-z0-9]/.test(field.value) 
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                        : <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                      <span className={field.value && /[^A-Za-z0-9]/.test(field.value) ? "text-foreground" : "text-muted-foreground"}>
                        Al menos un carácter especial
                      </span>
                    </li>
                  </ul>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="pr-10 bg-background"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
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
          
          <Button
            type="submit"
            className="w-full mt-6 bg-primary"
            disabled={isLoading || passwordScore < 50}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner className="mr-2" />
                <span>Procesando...</span>
              </div>
            ) : (
              "Crear cuenta"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 