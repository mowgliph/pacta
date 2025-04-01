import { useStore, type StoreState } from '@/store'
import { useQuery } from '@tanstack/react-query'
import { contractService } from '../../services/ContractService'
import { ContractCard } from '../ContractCard'
import { ContractListSkeleton } from './ContractListSkeleton'
import { ContractListError } from './ContractListError'
import { ContractListEmpty } from './ContractListEmpty'

export function ContractList() {
  const filtros = useStore((state: StoreState) => state.filtros)
  const { data: contratos, isLoading, error } = useQuery({
    queryKey: ['contracts', filtros],
    queryFn: async () => {
      const params = {
        estado: filtros.estado,
        busqueda: filtros.busqueda,
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
        empresaId: filtros.empresaId,
        departamentoId: filtros.departamentoId,
        etiquetas: filtros.etiquetas,
        pagina: filtros.pagina,
        limite: filtros.limite,
        ordenarPor: filtros.ordenarPor,
        direccionOrden: filtros.direccionOrden
      }
      return await contractService.getAll(params)
    },
    select: (response) => response.data
  })

  if (isLoading) return <ContractListSkeleton />
  if (error) return <ContractListError message={(error as Error).message} />
  if (!contratos?.length) return <ContractListEmpty />

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contratos.map((contrato) => (
        <ContractCard key={contrato.id} contract={contrato} />
      ))}
    </div>
  )
}