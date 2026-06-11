import { useAuthStore } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function ComercianteDashboard() {
  const { cerrarSesion } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await cerrarSesion()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Panel Comerciante
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>
        <p className="text-gray-500">Catálogo y semáforo — en construcción</p>
      </div>
    </div>
  )
}