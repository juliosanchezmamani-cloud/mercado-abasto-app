import { useState, useEffect } from 'react'
import { useAuthStore } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  getSectores, addSector, deleteSector,
  getPasillos, addPasillo, deletePasillo
} from '../services/geografiaService'
import {
  getComerciantes, crearComerciante,
  toggleActivarComerciante, deleteComerciante
} from '../services/usuariosService'
import { getLogs } from '../services/auditService'

const TABS = ['Geografía', 'Comerciantes', 'Auditoría']

export default function AdminDashboard() {
  const { cerrarSesion } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Geografía')

  // Geografía
  const [sectores, setSectores] = useState([])
  const [sectorSeleccionado, setSectorSeleccionado] = useState(null)
  const [pasillos, setPasillos] = useState([])
  const [nuevoSector, setNuevoSector] = useState('')
  const [nuevoPasillo, setNuevoPasillo] = useState('')

  // Comerciantes
  const [comerciantes, setComerciantes] = useState([])
  const [modalComercante, setModalComerciante] = useState(false)
  const [formComerciante, setFormComerciante] = useState({
    nombre: '', email: '', password: '', sectorId: '', pasilloId: ''
  })
  const [pasillosForm, setPasillosForm] = useState([])

  // Auditoría
  const [logs, setLogs] = useState([])

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const cargarSectores = async () => {
    const data = await getSectores()
    setSectores(data)
  }

  const cargarPasillos = async (sectorId) => {
    const data = await getPasillos(sectorId)
    setPasillos(data)
  }

  const cargarComerciantes = async () => {
    const data = await getComerciantes()
    setComerciantes(data)
  }

  const cargarLogs = async () => {
    const data = await getLogs()
    setLogs(data)
  }

  useEffect(() => { cargarSectores() }, [])
  useEffect(() => { if (sectorSeleccionado) cargarPasillos(sectorSeleccionado.id) }, [sectorSeleccionado])
  useEffect(() => { if (tab === 'Comerciantes') cargarComerciantes() }, [tab])
  useEffect(() => { if (tab === 'Auditoría') cargarLogs() }, [tab])

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
    if (sectorSeleccionado?.id === id) { setSectorSeleccionado(null); setPasillos([]) }
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

  const cargarPasillosForm = async (sectorId) => {
    const data = await getPasillos(sectorId)
    setPasillosForm(data)
  }

  const handleCrearComerciante = async () => {
    const { nombre, email, password, sectorId, pasilloId } = formComerciante
    if (!nombre || !email || !password || !sectorId || !pasilloId) {
      setError('Completá todos los campos')
      return
    }
    setCargando(true)
    setError('')
    try {
      await crearComerciante({ nombre, email, password, sectorId, pasilloId })
      setModalComerciante(false)
      setFormComerciante({ nombre: '', email: '', password: '', sectorId: '', pasilloId: '' })
      await cargarComerciantes()
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
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
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
          Cerrar sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium border-b-2 transition-all ${
                tab === t ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">

        {/* TAB: Geografía */}
        {tab === 'Geografía' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Sectores</h2>
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Nombre del sector" value={nuevoSector}
                  onChange={(e) => setNuevoSector(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button onClick={handleAddSector} disabled={cargando}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                  Agregar
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {sectores.length === 0 && <p className="text-gray-400 text-sm">No hay sectores</p>}
                {sectores.map(sector => (
                  <div key={sector.id} onClick={() => setSectorSeleccionado(sector)}
                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-all ${
                      sectorSeleccionado?.id === sector.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span className="text-sm font-medium text-gray-700">{sector.nombre}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSector(sector.id) }}
                      className="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Pasillos</h2>
              {sectorSeleccionado
                ? <p className="text-xs text-green-600 mb-4">Sector: {sectorSeleccionado.nombre}</p>
                : <p className="text-xs text-gray-400 mb-4">Seleccioná un sector</p>}
              {sectorSeleccionado && (
                <>
                  <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Número o nombre del pasillo" value={nuevoPasillo}
                      onChange={(e) => setNuevoPasillo(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <button onClick={handleAddPasillo} disabled={cargando}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                      Agregar
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {pasillos.length === 0 && <p className="text-gray-400 text-sm">No hay pasillos</p>}
                    {pasillos.map(pasillo => (
                      <div key={pasillo.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-700">Pasillo {pasillo.numero}</span>
                        <button onClick={() => handleDeletePasillo(pasillo.id)}
                          className="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB: Comerciantes */}
        {tab === 'Comerciantes' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Comerciantes registrados</h2>
              <button onClick={() => setModalComerciante(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                + Nuevo comerciante
              </button>
            </div>
            {comerciantes.length === 0 && <p className="text-gray-400 text-sm">No hay comerciantes registrados</p>}
            <div className="flex flex-col gap-2">
              {comerciantes.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      c.estado === 'abierto' ? 'bg-green-100 text-green-700' :
                      c.estado === 'pausa' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {c.estado}
                    </span>
                    <button onClick={() => deleteComerciante(c.id).then(cargarComerciantes)}
                      className="text-red-400 hover:text-red-600 text-xs">
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Auditoría */}
        {tab === 'Auditoría' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Log de auditoría</h2>
            {logs.length === 0 && <p className="text-gray-400 text-sm">No hay registros todavía</p>}
            <div className="flex flex-col gap-2">
              {logs.map(log => (
                <div key={log.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {log.tipo}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Valor: {log.valorNuevo}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {log.timestamp?.toDate?.().toLocaleString('es-BO') || ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal nuevo comerciante */}
      {modalComercante && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nuevo comerciante</h3>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Nombre completo" value={formComerciante.nombre}
                onChange={(e) => setFormComerciante({ ...formComerciante, nombre: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <input type="email" placeholder="Email" value={formComerciante.email}
                onChange={(e) => setFormComerciante({ ...formComerciante, email: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <input type="password" placeholder="Contraseña" value={formComerciante.password}
                onChange={(e) => setFormComerciante({ ...formComerciante, password: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              <select value={formComerciante.sectorId}
                onChange={async (e) => {
                  setFormComerciante({ ...formComerciante, sectorId: e.target.value, pasilloId: '' })
                  await cargarPasillosForm(e.target.value)
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Seleccioná un sector</option>
                {sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
              <select value={formComerciante.pasilloId}
                onChange={(e) => setFormComerciante({ ...formComerciante, pasilloId: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!formComerciante.sectorId}>
                <option value="">Seleccioná un pasillo</option>
                {pasillosForm.map(p => <option key={p.id} value={p.id}>Pasillo {p.numero}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setModalComerciante(false); setError('') }}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleCrearComerciante} disabled={cargando}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                {cargando ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}