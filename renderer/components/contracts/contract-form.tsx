'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useContractStore } from '../../store/useContractStore';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { FileUpload } from '../ui/file-upload';
import { contractSchema } from '../../lib/shemas';
import { contractsApi } from '../../api/contracts';
import { cn } from '../../lib/utils';
import type {
  CreateContractRequest,
  BankDetails,
  LegalRepresentative,
  Attachment
} from '../../../main/shared/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Calendar } from '../ui/calendar';
import { useState } from 'react';

// Tipo para props del componente
interface ContractFormProps {
  contractData?: any; // Contrato existente para edición
  isEditing?: boolean;
}

export function ContractForm({ contractData, isEditing = false }: ContractFormProps) {
  const router = useRouter();
  const createContract = useContractStore((state) => state.createContract);
  const updateContract = useContractStore((state) => state.updateContract); // Si existe en el store
  const [loading, setLoading] = useState(false);
  
  // Inicializar formulario con React Hook Form + Zod
  const form = useForm<any>({
    resolver: zodResolver(contractSchema),
    defaultValues: isEditing && contractData
      ? contractData
      : {
          contractNumber: '',
          title: '',
          type: 'Cliente',
          status: 'Vigente',
          description: '',
          parties: '',
          signDate: '',
          signPlace: '',
          startDate: '',
          endDate: '',
          companyName: '',
          companyAddress: '',
          nationality: '',
          commercialAuth: '',
          reeupCode: '',
          nit: '',
          contactPhones: [''],
          bankDetails: {
            account: '',
            branch: '',
            agency: '',
            holder: '',
            currency: 'CUP',
          },
          legalRepresentative: {
            name: '',
            position: '',
            documentType: '',
            documentNumber: '',
            documentDate: '',
          },
          attachments: [],
          createdById: '',
          ownerId: '',
        },
  });
  
  // Manejar envío del formulario
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let id;
      if (isEditing && contractData?.id) {
        const ok = await updateContract(contractData.id, data);
        if (!ok) throw new Error('Error al actualizar el contrato');
        id = contractData.id;
      } else {
        id = await createContract(data);
      }
      router.push(`/contracts/${id}`);
      router.refresh();
    } catch (error) {
      alert('Error al guardar el contrato');
    } finally {
      setLoading(false);
    }
  };
  
  // Helpers para arrays dinámicos
  const addToArray = (field: any, value: any) => field.onChange([...(field.value || []), value]);
  const removeFromArray = (field: any, idx: number) => field.onChange(field.value.filter((_: any, i: number) => i !== idx));
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
      {/* 1. Datos Generales */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Datos Generales</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="contractNumber"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Número de Contrato</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ej: CONT-2025-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Título del Contrato</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Título del contrato" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Tipo de Contrato</FormLabel>
                <FormControl>
                  <Select {...field} disabled={isEditing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de contrato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cliente">Cliente</SelectItem>
                      <SelectItem value="Proveedor">Proveedor</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Estado del Contrato</FormLabel>
                <FormControl>
                  <Select {...field} defaultValue={form.watch('status')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estado del contrato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vigente">Vigente</SelectItem>
                      <SelectItem value="Próximo a Vencer">Próximo a Vencer</SelectItem>
                      <SelectItem value="Vencido">Vencido</SelectItem>
                      <SelectItem value="Archivado">Archivado</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Descripción General del Contrato</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Descripción general del contrato" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parties"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Describa las partes involucradas</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describa las partes involucradas" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </section>

      {/* 2. Fechas y Lugar */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Fechas y Lugar</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="signDate"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Fecha de Firma</FormLabel>
                <FormControl>
                  <Calendar value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="signPlace"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Lugar de Firma</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ciudad, País" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio</FormLabel>
                <FormControl>
                  <Calendar value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Fecha de Finalización</FormLabel>
                <FormControl>
                  <Calendar value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* 3. Empresa y Dirección */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Empresa y Dirección</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Nombre de la Empresa</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nombre de la empresa" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyAddress"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Dirección Legal</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Dirección legal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Nacionalidad de la Empresa</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nacionalidad de la empresa" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="commercialAuth"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Código de Autorización</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Código de autorización" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reeupCode"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Código REEUP</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Código REEUP" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nit"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>NIT</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="NIT" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhones"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Teléfonos de Contacto</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {field.value.map((phone: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          {...field.onChange(phone)}
                          placeholder="Ej: 555-1234"
                        />
                        <button type="button" onClick={() => removeFromArray(field, idx)}>
                          Eliminar
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addToArray(field, '')}>
                      Agregar teléfono
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankDetails.account"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Número de Cuenta</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Número de cuenta" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankDetails.branch"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Sucursal Bancaria</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Sucursal bancaria" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankDetails.agency"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Agencia Bancaria</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Agencia bancaria" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankDetails.holder"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Titular de la Cuenta</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Titular de la cuenta" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bankDetails.currency"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <FormControl>
                  <Select {...field}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUP">CUP</SelectItem>
                      <SelectItem value="MLC">MLC</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* 4. Representante Legal */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Representante Legal</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="legalRepresentative.name"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nombre completo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="legalRepresentative.position"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Cargo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="legalRepresentative.documentType"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Tipo de Documento</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Tipo de documento" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="legalRepresentative.documentNumber"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Número de Documento</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Número de documento" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="legalRepresentative.documentDate"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Fecha de Emisión</FormLabel>
                <FormControl>
                  <Calendar value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      {/* 5. Anexos (array dinámico) */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Anexos</h2>
        <div className="space-y-2">
          {form.watch('attachments').map((anexo: Attachment, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <FormField
                control={form.control}
                name={`attachments.${idx}.type`}
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Tipo de Anexo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tipo de anexo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`attachments.${idx}.description`}
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Descripción" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`attachments.${idx}.documentUrl`}
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>URL del Documento</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="URL del documento (opcional)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button type="button" onClick={() => removeFromArray(form.register(`attachments.${idx}`), 0)}>
                Eliminar
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addToArray(form.register('attachments'), { type: '', description: '', documentUrl: '' })}>
            Agregar anexo
          </button>
        </div>
      </section>

      {/* 6. Documentos */}
      <section>
        <h2 className="font-semibold text-lg mb-2">Documento Principal</h2>
        <div className="space-y-2">
          <FormField
            control={form.control}
            name="attachments.0.description"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Descripción del Documento Principal</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Descripción del documento principal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="attachments.0.documentUrl"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>URL del Documento Principal</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="URL del documento principal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="attachments.0.file"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Documento Principal</FormLabel>
                <FormControl>
                  <FileUpload
                    accept=".pdf,.doc,.docx"
                    maxSize={10}
                    label="Documento principal"
                    onFileSelected={(file) => field.onChange(file)}
                    description="Seleccione el documento principal del contrato (PDF, DOC, DOCX, máx. 10MB)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={() => router.back()}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            isEditing ? 'Actualizar Contrato' : 'Crear Contrato'
          )}
        </button>
      </div>
    </form>
  );
}