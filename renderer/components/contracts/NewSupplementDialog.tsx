"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { DatePicker } from "../ui/date-picker"
import { LoadingSpinner } from "../ui/loading-spinner"
import { FileUpload } from "../ui/file-upload"
import { useToast } from "../ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

// Esquema de validación
const supplementSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  changeType: z.enum(["modification", "extension", "termination"]),
  effectiveDate: z.date({
    required_error: "La fecha efectiva es obligatoria",
  }),
  changes: z.record(z.any()).optional(),
})

type SupplementFormValues = z.infer<typeof supplementSchema>

interface NewSupplementDialogProps {
  isOpen: boolean
  onClose: () => void
  contractId: string
  onSuccess?: () => void
}

export function NewSupplementDialog({ isOpen, onClose, contractId, onSuccess }: NewSupplementDialogProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [supplementFile, setSupplementFile] = useState<File | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({})
  const { toast } = useToast()

  // Valores por defecto
  const defaultValues: Partial<SupplementFormValues> = {
    title: "",
    description: "",
    changeType: "modification",
    effectiveDate: new Date(),
    changes: {},
  }

  const form = useForm<SupplementFormValues>({
    resolver: zodResolver(supplementSchema),
    defaultValues,
  })

  const onSubmit = async (data: SupplementFormValues) => {
    // Verificar que hay al menos un cambio
    if (selectedFields.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un campo para modificar",
        variant: "destructive",
      })
      return
    }

    // Preparar los cambios
    const changes: Record<string, any> = {}
    selectedFields.forEach((field) => {
      changes[field] = fieldValues[field]
    })

    setIsSubmitting(true)

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData()

      // Añadir datos del suplemento
      formData.append(
        "data",
        JSON.stringify({
          ...data,
          contractId,
          changes,
        }),
      )

      // Añadir archivo si existe
      if (supplementFile) {
        formData.append("file", supplementFile)
      }

      // Enviar a la API
      const response = await fetch("/api/supplements", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Suplemento creado correctamente",
        })
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el suplemento",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el suplemento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldSelection = (field: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFields([...selectedFields, field])
    } else {
      setSelectedFields(selectedFields.filter((f) => f !== field))
    }
  }

  const handleFieldValueChange = (field: string, value: any) => {
    setFieldValues({
      ...fieldValues,
      [field]: value,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nuevo Suplemento</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="basic">Información Básica</TabsTrigger>
              <TabsTrigger value="changes">Cambios</TabsTrigger>
              <TabsTrigger value="document">Documento</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Suplemento</Label>
                <Input id="title" {...form.register("title")} placeholder="Ej: Extensión de plazo" />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describa el propósito del suplemento"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="changeType">Tipo de Cambio</Label>
                  <Select
                    defaultValue={form.getValues("changeType")}
                    onValueChange={(value) => form.setValue("changeType", value as any)}
                  >
                    <SelectTrigger id="changeType">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modification">Modificación</SelectItem>
                      <SelectItem value="extension">Extensión</SelectItem>
                      <SelectItem value="termination">Terminación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fecha Efectiva</Label>
                  <DatePicker
                    date={form.getValues("effectiveDate")}
                    setDate={(date) => form.setValue("effectiveDate", date)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="changes" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    Seleccione los campos que desea modificar y proporcione los nuevos valores.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="field-endDate"
                      checked={selectedFields.includes("endDate")}
                      onChange={(e) => handleFieldSelection("endDate", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="field-endDate">Fecha de Fin</Label>
                  </div>
                  {selectedFields.includes("endDate") && (
                    <div className="ml-6">
                      <DatePicker
                        date={fieldValues.endDate?.newValue}
                        setDate={(date) =>
                          handleFieldValueChange("endDate", {
                            oldValue: null, // Se obtendrá del backend
                            newValue: date,
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="field-initialValue"
                      checked={selectedFields.includes("initialValue")}
                      onChange={(e) => handleFieldSelection("initialValue", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="field-initialValue">Valor</Label>
                  </div>
                  {selectedFields.includes("initialValue") && (
                    <div className="ml-6 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="initialValueAmount">Nuevo Monto</Label>
                        <Input
                          id="initialValueAmount"
                          type="number"
                          step="0.01"
                          placeholder="Ej: 1000.00"
                          onChange={(e) => {
                            const amount = Number.parseFloat(e.target.value)
                            handleFieldValueChange("initialValue", {
                              oldValue: null, // Se obtendrá del backend
                              newValue: {
                                amount: isNaN(amount) ? 0 : amount,
                                currency: fieldValues.initialValue?.newValue?.currency || "CUP",
                              },
                            })
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="initialValueCurrency">Moneda</Label>
                        <Select
                          defaultValue="CUP"
                          onValueChange={(value) => {
                            handleFieldValueChange("initialValue", {
                              oldValue: null, // Se obtendrá del backend
                              newValue: {
                                amount: fieldValues.initialValue?.newValue?.amount || 0,
                                currency: value,
                              },
                            })
                          }}
                        >
                          <SelectTrigger id="initialValueCurrency">
                            <SelectValue placeholder="Seleccionar moneda" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUP">CUP</SelectItem>
                            <SelectItem value="MLC">MLC</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="field-description"
                      checked={selectedFields.includes("description")}
                      onChange={(e) => handleFieldSelection("description", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="field-description">Descripción</Label>
                  </div>
                  {selectedFields.includes("description") && (
                    <div className="ml-6">
                      <Textarea
                        placeholder="Nueva descripción"
                        rows={3}
                        onChange={(e) =>
                          handleFieldValueChange("description", {
                            oldValue: null, // Se obtendrá del backend
                            newValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="field-deliveryTerm"
                      checked={selectedFields.includes("deliveryTerm")}
                      onChange={(e) => handleFieldSelection("deliveryTerm", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="field-deliveryTerm">Plazo de Entrega</Label>
                  </div>
                  {selectedFields.includes("deliveryTerm") && (
                    <div className="ml-6">
                      <Input
                        placeholder="Nuevo plazo de entrega"
                        onChange={(e) =>
                          handleFieldValueChange("deliveryTerm", {
                            oldValue: null, // Se obtendrá del backend
                            newValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="field-paymentTerm"
                      checked={selectedFields.includes("paymentTerm")}
                      onChange={(e) => handleFieldSelection("paymentTerm", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="field-paymentTerm">Plazo de Pago</Label>
                  </div>
                  {selectedFields.includes("paymentTerm") && (
                    <div className="ml-6">
                      <Input
                        placeholder="Nuevo plazo de pago"
                        onChange={(e) =>
                          handleFieldValueChange("paymentTerm", {
                            oldValue: null, // Se obtendrá del backend
                            newValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="field-warrantyTerm"
                      checked={selectedFields.includes("warrantyTerm")}
                      onChange={(e) => handleFieldSelection("warrantyTerm", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="field-warrantyTerm">Plazo de Garantía</Label>
                  </div>
                  {selectedFields.includes("warrantyTerm") && (
                    <div className="ml-6">
                      <Input
                        placeholder="Nuevo plazo de garantía"
                        onChange={(e) =>
                          handleFieldValueChange("warrantyTerm", {
                            oldValue: null, // Se obtendrá del backend
                            newValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="document" className="space-y-4 mt-4">
              <FileUpload
                accept=".pdf,.doc,.docx"
                maxSize={10 * 1024 * 1024} // 10MB
                onFileSelected={setSupplementFile}
                label="Documento del suplemento"
                description="Sube el documento firmado del suplemento (PDF, Word, máx. 10MB)"
              />

              {supplementFile && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    Archivo seleccionado: {supplementFile.name} ({(supplementFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Guardando...
                </>
              ) : (
                "Crear Suplemento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
