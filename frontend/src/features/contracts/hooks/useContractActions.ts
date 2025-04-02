import { useStore } from '@/store'
import { useNavigate } from '@remix-run/react'

export function useContractActions() {
  const navigate = useNavigate()
  const { eliminarContrato } = useStore()

  const handleEdit = (id: number) => {
    navigate(`/contracts/${id}/edit`)
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