"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useForm, ControllerRenderProps } from "react-hook-form";
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
import { toast } from "sonner";
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Esquema de validación para el formulario de login
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Formato de correo inválido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida"),
  rememberMe: z.boolean(),
});

// Tipo para los datos del formulario
type LoginFormValues = z.infer<typeof loginSchema>;

export function ModernLoginForm() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

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
        toast.success("Inicio de sesión exitoso", {
          description: "Redirigiendo al Dashboard...",
          duration: 2000,
        });
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setAuthError("Ocurrió un error al iniciar sesión. Por favor, inténtelo de nuevo.");
      }
    } catch (error: any) {
      console.error("Error de login:", error);
      setAuthError(error.message || "Credenciales inválidas.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8 text-center">
        <motion.div
          className="flex items-center justify-center gap-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <img
            src="/images/logo.png"
            alt="PACTA Logo"
            className="w-12 h-12"
          />
          <h1 className="text-4xl font-bold text-black">
            PACTA
          </h1>
        </motion.div>
        <p className="text-muted-foreground mt-2">
          Sistema de Gestión de Contratos
        </p>
      </div>

      <motion.div 
        className="bg-card/50 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Inicia sesión</h2>
          <p className="text-muted-foreground mt-1">
            Ingrese sus credenciales para continuar
          </p>
        </div>

        {authError && (
          <motion.div 
            className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md flex items-start space-x-2 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error de autenticación</p>
              <p className="text-sm">{authError}</p>
            </div>
          </motion.div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: ControllerRenderProps<LoginFormValues, "email"> }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Correo electrónico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="correo@ejemplo.com"
                        type="email"
                        {...field}
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: ControllerRenderProps<LoginFormValues, "password"> }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">Contraseña</FormLabel>
                    <button
                      type="button"
                      className="text-xs text-primary hover:text-primary/80 hover:underline"
                    >
                      ¿Olvidó su contraseña?
                    </button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                        disabled={isLoading}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              render={({ field }: { field: ControllerRenderProps<LoginFormValues, "rememberMe"> }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium leading-none">
                    Recordarme
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </Form>
      </motion.div>

      <motion.div 
        className="mt-6 text-center text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>© {new Date().getFullYear()} PACTA - Todos los derechos reservados</p>
      </motion.div>
    </motion.div>
  );
}