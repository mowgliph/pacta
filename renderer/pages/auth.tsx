"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Spinner } from "../components/ui/spinner";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, LogIn, Mail, Key } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useAuth();

  // Determinar el dominio de correo a partir del appId
  const emailDomain = "pacta.app";

  // Precargar los usuarios de prueba
  const handleQuickLogin = (userType: "admin" | "ra") => {
    const userEmail = userType === "admin" ? "admin@" + emailDomain : "ra@" + emailDomain;
    setEmail(userEmail);
    setPassword("pacta");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor, ingrese su correo electrónico y contraseña",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Determinar si es un usuario con privilegios especiales
      const isSpecialUser = 
        (email === "admin@" + emailDomain || email === "ra@" + emailDomain) && 
        password === "pacta";
      
      // Pasar un flag para identificar usuarios especiales al proceso principal
      const success = await login(email, password, rememberMe, isSpecialUser);

      if (success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido al sistema PACTA",
        });
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error);
      toast({
        title: "Error de inicio de sesión",
        description:
          error.message ||
          "Ocurrió un error al intentar iniciar sesión. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--app-background))] dark:bg-gray-900">
      <motion.div 
        className="w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Lado izquierdo - Branding e información */}
          <div className="w-full md:w-5/12 bg-gradient-to-br from-accent to-accent/70 text-white p-12 flex flex-col">
            <div className="mb-8 flex items-center">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mr-4">
                <Image
                  src="/images/logo.png"
                  alt="PACTA Logo"
                  width={32}
                  height={32}
                />
              </div>
              <h1 className="text-3xl font-bold">PACTA</h1>
            </div>
            
            <div className="my-auto">
              <h2 className="text-4xl font-bold mb-6">Bienvenido</h2>
              <p className="text-lg mb-6 text-white/90">
                Sistema integral de gestión de contratos
              </p>
              <p className="text-white/70 mb-8 max-w-sm">
                Acceda a su cuenta para gestionar contratos, monitorear vencimientos 
                y administrar toda la documentación legal de manera eficiente.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => handleQuickLogin("admin")}
              >
                Iniciar como Administrador
              </Button>
              <Button 
                variant="outline"
                className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => handleQuickLogin("ra")}
              >
                Iniciar como RA
              </Button>
            </div>
            
            <div className="mt-8 text-sm text-white/60">
              © {new Date().getFullYear()} PACTA. Todos los derechos reservados.
            </div>
          </div>

          {/* Lado derecho - Formulario */}
          <div className="w-full md:w-7/12 p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Iniciar sesión
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Ingrese sus credenciales para acceder al sistema
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                      Correo electrónico
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                        className="pl-10 border-gray-300 focus:border-accent focus:ring-accent dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                        Contraseña
                      </Label>
                      <a
                        href="#"
                        className="text-sm text-accent hover:text-accent/90 dark:text-accent/80"
                      >
                        ¿Olvidó su contraseña?
                      </a>
                    </div>
                    <div className="relative mt-1">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        className="pl-10 pr-10 border-gray-300 focus:border-accent focus:ring-accent dark:bg-gray-700 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Recordar mis datos
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner className="mr-2" />
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Iniciar sesión
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
