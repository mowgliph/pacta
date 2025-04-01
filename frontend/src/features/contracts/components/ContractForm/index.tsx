import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateContractData } from '../../services/contracts-service'
import { ContractFileUpload } from './ContractFileUpload'
import { ContractTypeSelector } from './ContractTypeSelector'

// Propiedades para el formulario de contrato
interface ContractFormProps {
  onSubmit: (data: CreateContractData, documentFile?: File) => void
  isSubmitting?: boolean
  isCreating?: boolean
  initialData?: Partial<CreateContractData>
}

/**
 * Formulario para crear o editar contratos
 */
export const ContractForm: React.FC<ContractFormProps> = ({
  onSubmit,
  isSubmitting = false,
  isCreating = true,
  initialData = {}
}) => {
  // Estado para archivo adjunto
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Crear formulario con react-hook-form
  const form = useForm<CreateContractData>({
    defaultValues: {
      name: initialData.name || '',
      description: initialData.description || '',
      contractNumber: initialData.contractNumber || '',
      companyId: initialData.companyId || '',
      startDate: initialData.startDate || '',
      endDate: initialData.endDate || '',
      value: initialData.value || 0,
      currency: initialData.currency || 'CUP',
      type: initialData.type || 'client',
      authorizedBy: initialData.authorizedBy || '',
      ...initialData
    }
  })
  
  // Manejar cambio de archivo
  const handleFileChange = (file: File | null) => {
    setDocumentFile(file)
  }
  
  // Manejar envío del formulario
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data, documentFile || undefined)
  })
  
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex flex-wrap">
            <TabsTrigger value="basic">Información básica</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6">
            {/* Tipo de contrato */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <ContractTypeSelector 
                    value={field.value as 'client' | 'provider'} 
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Información básica */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contractNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de contrato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: CONT-2023-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del contrato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el título del contrato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describa brevemente el propósito del contrato"
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de finalización</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="ID de la empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="authorizedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Autorizado por</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la persona autorizante" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor del contrato</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <FormControl>
                      <Input placeholder="CUP, USD, EUR..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-6">
            <ContractFileUpload
              onChange={handleFileChange}
              label="Documento del contrato"
            />
          </TabsContent>
        </Tabs>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              if (activeTab === 'basic') {
                // Si estamos en la primera pestaña, es equivalente a cancelar
                return
              }
              
              // Determinar la pestaña anterior
              const tabs = ['basic', 'details', 'documents']
              const currentIndex = tabs.indexOf(activeTab)
              const previousTab = tabs[currentIndex - 1]
              setActiveTab(previousTab)
            }}
          >
            Anterior
          </Button>
          
          {activeTab !== 'documents' ? (
            <Button 
              type="button"
              onClick={() => {
                // Determinar la siguiente pestaña
                const tabs = ['basic', 'details', 'documents']
                const currentIndex = tabs.indexOf(activeTab)
                const nextTab = tabs[currentIndex + 1]
                setActiveTab(nextTab)
              }}
            >
              Siguiente
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (isCreating ? 'Crear contrato' : 'Actualizar contrato')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
} 