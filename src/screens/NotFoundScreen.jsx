import { useNavigate } from 'react-router-dom'
import { Store, ArrowLeft } from 'lucide-react'

export default function NotFoundScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 w-full max-w-sm text-center">
        <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="text-emerald-700" size={28} />
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-gray-500 text-sm mb-1">Página no encontrada</p>
        <p className="text-gray-400 text-xs mb-6">
          La ruta que buscás no existe en el sistema
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-900 transition-colors mx-auto"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </button>
      </div>
    </div>
  )
}