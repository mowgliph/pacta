"use client";

import { useMemo } from "react";
import { useRouter } from "next/router";
import { useZodForm } from "../hooks/useZodForm";
import { useAuthStore } from "../store/useAuthStore";
import { loginSchema } from "../api/auth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";

// Definir el tipo para los valores del formulario
type LoginFormValues = z.infer<typeof loginSchema>;

export default function Auth() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  
  const {
    values,
    errors,
    handleChange,
    handleSubmit
  } = useZodForm<typeof loginSchema>(
    loginSchema,
    { username: "", password: "", rememberMe: false }
  );

  const handleLogin = handleSubmit(async (data) => {
    try {
      const success = await login(data.username, data.password, data.rememberMe);
      if (success) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      toast({
        title: "Error de autenticación",
        description: "Ha ocurrido un error al intentar iniciar sesión",
      });
    }
  });

  // Mostrar mensaje de error si existe
  useMemo(() => {
    if (error) {
      toast({
        title: "Error de autenticación",
        description: error,
      });
    }
  }, [error]);

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-md p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-200">PACTA</h1>
          <p className="text-muted-foreground">
            Sistema de Gestión de Contratos
          </p>
        </div>

        <Card className="border-primary-100/20 shadow-lg">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    placeholder="Ingrese su nombre de usuario"
                    type="text"
                    value={values.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    autoComplete="username"
                    disabled={isLoading}
                    className={errors.username ? "border-error-400" : ""}
                  />
                  {errors.username && (
                    <p className="text-sm text-error-500">{errors.username}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    placeholder="Ingrese su contraseña"
                    type="password"
                    value={values.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    autoComplete="current-password"
                    disabled={isLoading}
                    className={errors.password ? "border-error-400" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-error-500">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={values.rememberMe}
                    onCheckedChange={(checked) =>
                      handleChange("rememberMe", checked === true)
                    }
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none"
                  >
                    Recordarme
                  </Label>
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-primary-200 hover:bg-primary-300"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PACTA - Todos los derechos reservados</p>
        </div>
      </div>
    </motion.div>
  );
}
