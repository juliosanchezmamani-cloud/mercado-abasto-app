import { useState, useEffect } from 'react'
import { useAuthStore } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  getSectores, addSector, deleteSector,
  getPasillos, addPasillo, deletePasillo
} from '../services/geografiaService'

export default function AdminDashboard() {
  const { cerrarSesion } = useAuthStore()
  const navigate = useNavigate()

  const [sectores, setSectores] = useState([])
  const [sectorSeleccionado, setSectorSeleccionado] = useState(null)
  const [pasillos, setPasillos] = useState([])
  const [nuevoSector, setNuevoSector] = useState('')
  const [nuevoPasillo, setNuevoPasillo] = useState('')
  const [cargando, setCargando] = useState(false)

  const cargarSectores = async () => {
    const data = await getSectores()
    setSectores(data)
  }

  const cargarPasillos = async (sectorId) => {
    const data = await getPasillos(sectorId)
    setPasillos(data)
  }

  useEffect(() => {
    cargarSectores()
  }, [])

  useEffect(() => {
    if (sectorSeleccionado) cargarPasillos(sectorSeleccionado.id)
  }, [sectorSeleccionado])

  const handleAddSector = async () => {
    if (!nuevoSector.trim()) return
    setCargando(true)
    await addSector(nuevoSector.trim())
    setNuevoSector('')
    await cargarSectores()
    setCargando(false)
  }

  const handleDeleteSector = async (id) => {
    await deleteSector(id)
    if (sectorSeleccionado?.id === id) {
      setSectorSeleccionado(null)
      setPasillos([])
    }
    await cargarSectores()
  }

  const handleAddPasillo = async () => {
    if (!nuevoPasillo.trim() || !sectorSeleccionado) return
    setCargando(true)
    await addPasillo(sectorSeleccionado.id, nuevoPasillo.trim())
    setNuevoPasillo('')
    await cargarPasillos(sectorSeleccionado.id)
    setCargando(false)
  }

  const handleDeletePasillo = async (pasilloId) => {
    await deletePasillo(sectorSeleccionado.id, pasilloId)
    await cargarPasillos(sectorSeleccionado.id)
  }

  const handleLogout = async () => {
    await cerrarSesion()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Panel Super Admin</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Sectores */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Sectores</h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Nombre del sector"
              value={nuevoSector}
              onChange={(e) => setNuevoSector(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleAddSector}
              disabled={cargando}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Agregar
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {sectores.length === 0 && (
              <p className="text-gray-400 text-sm">No hay sectores creados</p>
            )}
            {sectores.map((sector) => (
              <div
                key={sector.id}
                onClick={() => setSectorSeleccionado(sector)}
                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-all ${
                  sectorSeleccionado?.id === sector.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium text-gray-700">
                  {sector.nombre}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSector(sector.id)
                  }}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pasillos */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Pasillos</h2>
          {sectorSeleccionado ? (
            <p className="text-xs text-green-600 mb-4">
              Sector: {sectorSeleccionado.nombre}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mb-4">
              Seleccioná un sector para ver sus pasillos
            </p>
          )}

          {sectorSeleccionado && (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Número o nombre del pasillo"
                  value={nuevoPasillo}
                  onChange={(e) => setNuevoPasillo(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleAddPasillo}
                  disabled={cargando}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {pasillos.length === 0 && (
                  <p className="text-gray-400 text-sm">No hay pasillos en este sector</p>
                )}
                {pasillos.map((pasillo) => (
                  <div
                    key={pasillo.id}
                    className="flex justify-between items-center p-3 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">
                      Pasillo {pasillo.numero}
                    </span>
                    <button
                      onClick={() => handleDeletePasillo(pasillo.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}