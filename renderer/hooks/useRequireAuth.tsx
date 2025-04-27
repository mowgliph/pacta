import { useState, useCallback } from "react"
import { useRouter } from "next/router"
import { useAuth } from "./useAuth"
import { AlertModal } from "../components/ui/alert-modal"

interface UseRequireAuthOptions {
  redirectTo?: string
  showModal?: boolean
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = "/auth", showModal = true } = options
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const requireAuth = useCallback(
    (callback?: () => void) => {
      if (isAuthenticated) {
        callback && callback()
        return true
      }

      if (showModal) {
        setShowAuthModal(true)
      } else {
        router.push(redirectTo)
      }
      
      return false
    },
    [isAuthenticated, router, redirectTo, showModal]
  )

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false)
  }, [])

  const AuthModal = useCallback(
    () => (
      <AlertModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        type="auth"
        title="Inicio de sesión requerido"
        description="Debes iniciar sesión para acceder a esta funcionalidad"
      />
    ),
    [showAuthModal, closeAuthModal]
  )

  return {
    requireAuth,
    isAuthenticated,
    AuthModal,
    showAuthModal,
    closeAuthModal,
  }
} 