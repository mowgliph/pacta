import { useStore } from '@/store'
import { useEffect } from 'react'
import { ContractCard } from '../ContractCard'
import { ContractListSkeleton } from './ContractListSkeleton'
import { ContractListEmpty } from './ContractListEmpty'
import { ContractListError } from './ContractListError'

export function ContractList() {
  const { contratos, cargando, error, obtenerContratos } = useStore()

  useEffect(() => {
    obtenerContratos()
  }, [obtenerContratos])

  if (cargando) return <ContractListSkeleton />
  if (error) return <ContractListError message={error} />
  if (!contratos.length) return <ContractListEmpty />

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contratos.map((contrato) => (
        <ContractCard key={contrato.id} contrato={contrato} />
      ))}
    </div>
  )
}