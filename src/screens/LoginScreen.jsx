import { useState } from 'react'
import { useAuthStore } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Store, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { iniciarSesion } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const rol = await iniciarSesion(email, password)
      if (rol === 'admin') navigate('/admin')
      else if (rol === 'comerciante') navigate('/comerciante')
      else setError('Rol no reconocido')
    } catch (_err) {
      setError('Email o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">

        {/* Logo / Icono */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-emerald-800 p-3 rounded-2xl mb-4 shadow-lg shadow-emerald-200">
            <Store className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Mercado Abasto
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Iniciá sesión para gestionar tu cuenta
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 border border-red-100">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="bg-emerald-800 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-900 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
          >
            {cargando && <Loader2 className="animate-spin" size={16} />}
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Mercado Abasto · Santa Cruz de la Sierra
        </p>
      </div>
    </div>
  )
}