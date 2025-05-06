"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { handleIpcResponse } from "@/lib/handleIpcResponse";

function useToast() {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  return {
    toast,
    showSuccess: (message: string) => setToast({ type: "success", message }),
    showError: (message: string) => setToast({ type: "error", message }),
    hide: () => setToast(null),
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast, showSuccess, showError, hide } = useToast();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // @ts-ignore
      const res = await window.Electron.ipcRenderer.invoke("users:update", {
        id: user.id,
        name,
        email,
      });
      handleIpcResponse(res);
      showSuccess("Perfil actualizado correctamente.");
    } catch (err: any) {
      showError(err?.message || "Error al actualizar usuario");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api-error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!password || !newPassword) {
      showError("Completa ambos campos de contraseña.");
      setLoading(false);
      return;
    }
    try {
      // @ts-ignore
      const res = await window.Electron.ipcRenderer.invoke(
        "users:changePassword",
        {
          id: user.id,
          password,
          newPassword,
        }
      );
      handleIpcResponse(res);
      showSuccess("Contraseña actualizada correctamente.");
      setPassword("");
      setNewPassword("");
    } catch (err: any) {
      showError(err?.message || "No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 flex flex-col gap-8">
      {toast && toast.type === "error" && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{toast.message}</AlertDescription>
        </Alert>
      )}
      {toast && toast.type === "success" && (
        <Alert variant="success" className="mb-4">
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>{toast.message}</AlertDescription>
        </Alert>
      )}
      <h1 className="text-2xl font-semibold text-[#001B48] font-inter mb-2">
        Ajustes
      </h1>
      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil de usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-label="Nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Correo electrónico
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Correo electrónico"
              />
            </div>
            <Button
              type="submit"
              className="w-fit mt-2"
              disabled={loading}
              aria-label="Guardar cambios"
            >
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Contraseña actual
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-label="Contraseña actual"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nueva contraseña
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                aria-label="Nueva contraseña"
              />
            </div>
            <Button
              type="submit"
              className="w-fit mt-2"
              disabled={loading}
              aria-label="Actualizar contraseña"
            >
              Actualizar contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Preferencias */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm">Tema:</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
      {/* Placeholder para futuras opciones */}
      <Card>
        <CardHeader>
          <CardTitle>Opciones avanzadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-[#757575] text-sm">
            (Próximamente más opciones de configuración)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
