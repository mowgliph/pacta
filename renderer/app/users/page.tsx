"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../store/auth";
import { useUsers } from "../../lib/useUsers";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import {
  useContextMenu,
  ContextMenuAction,
} from "@/components/ui/context-menu";
import { useNotification } from "@/lib/useNotification";

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { users, loading, error } = useUsers();
  const { openContextMenu } = useContextMenu();
  const { notify } = useNotification();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-[#757575]">Cargando usuarios...</div>
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error al cargar usuarios</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg">
                <thead>
                  <tr className="bg-[#D6E8EE] text-[#001B48]">
                    <th className="px-4 py-2 text-left font-medium">Nombre</th>
                    <th className="px-4 py-2 text-left font-medium">Email</th>
                    <th className="px-4 py-2 text-left font-medium">Rol</th>
                    <th className="px-4 py-2 text-left font-medium">Estado</th>
                    <th className="px-4 py-2 text-left font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const actions: ContextMenuAction[] = [
                      {
                        label: "Editar usuario",
                        onClick: () => router.push(`/users/${u.id}`),
                      },
                      {
                        label: u.isActive ? "Desactivar" : "Reactivar",
                        onClick: async () => {
                          try {
                            // @ts-ignore
                            await window.Electron.ipcRenderer.invoke(
                              "users:update",
                              {
                                id: u.id,
                                isActive: !u.isActive,
                              }
                            );
                            notify({
                              title: u.isActive
                                ? "Usuario desactivado"
                                : "Usuario reactivado",
                              body: `El usuario ${u.name} ha sido ${
                                u.isActive ? "desactivado" : "reactivado"
                              }.`,
                              variant: "success",
                            });
                            window.location.reload();
                          } catch (err) {
                            notify({
                              title: "Error",
                              body: "No se pudo actualizar el estado del usuario.",
                              variant: "destructive",
                            });
                            if (typeof window !== "undefined") {
                              window.dispatchEvent(
                                new CustomEvent("api-error")
                              );
                            }
                          }
                        },
                      },
                      {
                        label: "Copiar email",
                        onClick: () => navigator.clipboard.writeText(u.email),
                      },
                    ];
                    return (
                      <tr
                        key={u.id}
                        className="even:bg-[#F9FBFC] hover:bg-[#D6E8EE] transition-colors"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          openContextMenu(actions, e.clientX, e.clientY);
                        }}
                      >
                        <td className="px-4 py-2 font-medium">{u.name}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.roleId}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              u.isActive
                                ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                                : "bg-[#F44336]/10 text-[#F44336]"
                            }`}
                          >
                            {u.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="outline" disabled>
                            Editar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
