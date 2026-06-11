import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuth'

export default function InicioScreen() {
  const { usuario, rol, cargando } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!cargando) {
      if (!usuario) {
        navigate('/login')
      } else if (rol === 'admin') {
        navigate('/admin')
      } else if (rol === 'comerciante') {
        navigate('/comerciante')
      } else {
        navigate('/login')
      }
    }
  }, [cargando, usuario, rol, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )
}