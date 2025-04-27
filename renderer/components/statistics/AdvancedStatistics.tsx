"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { LoadingSpinner } from "../ui/loading-spinner"
import { useContracts } from "../../hooks/useContracts"
import { ContractValueChart } from "./ContractValueChart"
import { ContractDurationChart } from "./ContractDurationChart"
import { ContractTrendChart } from "./ContractTrendChart"
import { ContractComparisonChart } from "./ContractComparisonChart"

export function AdvancedStatistics() {
  const { contracts, isLoading, fetchContracts } = useContracts()
  const [activeTab, setActiveTab] = useState("value")

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Estadísticas Avanzadas</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="value">Distribución por Valor</TabsTrigger>
          <TabsTrigger value="duration">Duración de Contratos</TabsTrigger>
          <TabsTrigger value="trend">Tendencias</TabsTrigger>
          <TabsTrigger value="comparison">Comparativas</TabsTrigger>
        </TabsList>

        <TabsContent value="value" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Contratos por Valor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ContractValueChart contracts={contracts} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="duration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Duración Promedio de Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ContractDurationChart contracts={contracts} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias de Creación y Vencimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ContractTrendChart contracts={contracts} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa Cliente vs Proveedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ContractComparisonChart contracts={contracts} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
