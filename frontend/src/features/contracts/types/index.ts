export interface Contract {
  id: number
  titulo: string
  codigo: string
  estado: 'borrador' | 'activo' | 'vencido' | 'terminado' | 'renovado'
  fechaInicio: string
  fechaFin: string
  descripcion?: string
  monto?: number
  moneda?: string
  cliente?: {
    id: number
    nombre: string
    email: string
  }
  documentos?: Array<{
    id: number
    nombre: string
    tipo: string
    url: string
  }>
  createdAt: string
  updatedAt: string
}

// Update the store slice to match the Contract interface
export interface ContractState {
  contratos: Contract[]
  cargando: boolean
  error: string | null
}

export type ContractStatus = Contract['estado']

export interface ContractFilters {
  estado?: ContractStatus
  fechaInicio?: string
  fechaFin?: string
  busqueda?: string
}