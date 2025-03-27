import { useStore } from '@/store'
import { useNavigate } from '@tanstack/react-router'

export function useContractActions() {
  const navigate = useNavigate()
  const { eliminarContrato } = useStore()

  const handleEdit = (id: number) => {
    navigate({ to: '/contracts/$contractId/edit', params: { contractId: id.toString() } })
  }

  const handleDelete = async (id: number) => {
    try {
      await eliminarContrato(id)
    } catch (error) {
      console.error('Error al eliminar el contrato:', error)
    }
  }

  return {
    handleEdit,
    handleDelete
  }
}