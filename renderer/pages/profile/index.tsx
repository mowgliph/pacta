// renderer/pages/profile/index.tsx
import React, { useEffect, useState } from "react";
import { Layout } from "../../components/layout/Layout";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { Heading } from "../../components/ui/heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { UserCircle } from "lucide-react";

// Esquema de validación para cambio de contraseña
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z
      .string()
      .min(8, "La confirmación de contraseña es requerida"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function Profile() {
  const auth = useRequireAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Formulario para cambio de contraseña
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    async function loadUserProfile() {
      if (auth.user) {
        try {
          setIsLoading(true);
          const profileData = await window.Electron.auth.getPerfil();
          setUserData(profileData);
        } catch (error) {
          console.error("Error al cargar perfil:", error);
          toast({
            title: "Error",
            description: "No se pudo cargar la información del perfil",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadUserProfile();
  }, [auth.user, toast]);

  const handlePasswordChange = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setIsSaving(true);
      await window.Electron.auth.cambiarContrasena({
        actual: data.currentPassword,
        nueva: data.newPassword,
      });

      toast({
        title: "Éxito",
        description: "Su contraseña ha sido actualizada",
      });

      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      toast({
        title: "Error",
        description:
          "No se pudo actualizar la contraseña. Verifique que la contraseña actual sea correcta.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!auth.user) return null;

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Heading
          title="Mi Perfil"
          description="Administra tu información personal y contraseña"
        />

        <Tabs defaultValue="profile" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Información Personal</TabsTrigger>
            <TabsTrigger value="password">Cambiar Contraseña</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información de Usuario</CardTitle>
                <CardDescription>
                  Consulta los detalles de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div>Cargando información...</div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-center mb-6">
                      <div className="bg-muted rounded-full p-4">
                        <UserCircle className="h-20 w-20 text-primary" />
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nombre</Label>
                          <Input
                            id="name"
                            value={userData?.name || ""}
                            disabled
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Correo Electrónico</Label>
                          <Input
                            id="email"
                            value={userData?.email || ""}
                            disabled
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="role">Rol</Label>
                        <Input
                          id="role"
                          value={userData?.role?.name || ""}
                          disabled
                        />
                      </div>

                      <div>
                        <Label htmlFor="createdAt">Fecha de Registro</Label>
                        <Input
                          id="createdAt"
                          value={
                            userData?.createdAt
                              ? new Date(
                                  userData.createdAt
                                ).toLocaleDateString()
                              : ""
                          }
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                  Actualiza tu contraseña para mantener segura tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handlePasswordChange)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña Actual</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Ingrese su contraseña actual"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nueva Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Ingrese su nueva contraseña"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            La contraseña debe tener al menos 8 caracteres
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Contraseña</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirme su nueva contraseña"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Guardando..." : "Cambiar Contraseña"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
