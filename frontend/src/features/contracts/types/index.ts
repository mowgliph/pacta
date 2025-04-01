export type Contract = {
  id: number
  title: string
  description?: string
  contractNumber: string
  startDate: string
  endDate: string
  value?: number
  companyId: number
  departmentId?: number
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED'
  files?: string[]
  tags?: string[]
  responsibleEmail?: string
  autoRenewal?: boolean
  renewalDays?: number
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: number
  company?: {
    id: number
    name: string
  }
  department?: {
    id: number
    name: string
  }
}

export type ContractFilters = {
  estado: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED' | undefined
  busqueda: string | undefined
  fechaInicio: string | undefined
  fechaFin: string | undefined
  empresaId: number | undefined
  departamentoId: number | undefined
  etiquetas: string[] | undefined
  pagina: number | undefined
  limite: number | undefined
  ordenarPor: string | undefined
  direccionOrden: 'asc' | 'desc' | undefined
}

// Update the store type
export type ContractState = {
  contratos: Contract[]
  contratoSeleccionado: Contract | null
  filtros: ContractFilters
  cargando: boolean
  error: string | null
}