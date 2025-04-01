import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/**
 * Página que muestra la lista de contratos disponibles
 * con filtros y opciones de acción
 */
export function ContractsListPage() {
  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
        <Button>Crear contrato</Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="expired">Expirados</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contratos activos</CardTitle>
              <CardDescription>
                Lista de todos los contratos actualmente vigentes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-8 text-center">
                  No hay contratos activos por el momento.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contratos pendientes</CardTitle>
              <CardDescription>
                Lista de contratos en espera de aprobación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-8 text-center">
                  No hay contratos pendientes por el momento.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expired" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contratos expirados</CardTitle>
              <CardDescription>
                Lista de contratos que han caducado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-8 text-center">
                  No hay contratos expirados por el momento.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 