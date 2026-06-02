import { useEffect, useState } from 'react'
import { db } from './config/firebase.js'
import { collection, getDocs } from 'firebase/firestore'

function App() {
  const [conexion, setConexion] = useState('Verificando conexión...')

  useEffect(() => {
    const verificar = async () => {
      try {
        await getDocs(collection(db, 'test'))
        setConexion('✅ Firebase conectado correctamente')
      } catch (error) {
        setConexion('❌ Error: ' + error.message)
      }
    }
    verificar()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Mercado Abasto App
        </h1>
        <p className="text-gray-600">{conexion}</p>
      </div>
    </div>
  )
}

export default App