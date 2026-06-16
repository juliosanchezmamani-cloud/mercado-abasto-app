import { useState, useEffect } from 'react'
import { useAuthStore } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  getSectores, addSector, deleteSector,
  getPasillos, addPasillo, deletePasillo
} from '../services/geografiaService'
import {
  getComerciantes, crearComerciante, deleteComerciante
} from '../services/usuariosService'
import { getLogs } from '../services/auditService'
import {
  ShieldCheck, LogOut, MapPin, Users, History,
  Plus, Trash2, X, Layers, Store
} from 'lucide-react'

const TABS = [
  { id: 'Geografía', icon: MapPin },
  { id: 'Comerciantes', icon: Users },
  { id: 'Auditoría', icon: History },
]

export default function AdminDashboard() {
  const { cerrarSesion } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Geografía')

  const [sectores, setSectores] = useState([])
  const [sectorSeleccionado, setSectorSeleccionado] = useState(null)
  const [pasillos, setPasillos] = useState([])
  const [nuevoSector, setNuevoSector] = useState('')
  const [nuevoPasillo, setNuevoPasillo] = useState('')

  const [comerciantes, setComerciantes] = useState([])
  const [modalComercante, setModalComerciante] = useState(false)
  const [formComerciante, setFormComerciante] = useState({
    nombre: '', email: '', password: '', sectorId: '', pasilloId: ''
  })
  const [pasillosForm, setPasillosForm] = useState([])

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

  const ESTADO_STYLES = {
    abierto: 'bg-green-100 text-green-700',
    pausa: 'bg-yellow-100 text-yellow-700',
    cerrado: 'bg-red-100 text-red-700',
  }

  const TIPO_LABELS = {
    cambio_estado: 'Cambio de estado',
    nuevo_producto: 'Nuevo producto',
    edicion_producto: 'Edición de producto',
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-800 p-2 rounded-xl">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <h1 className="text-lg font-bold text-gray-800">Panel Super Admin</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors">
          <LogOut size={16} />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6">
        <div className="flex gap-1 max-w-5xl mx-auto">
          {TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 py-3 px-3 text-sm font-medium border-b-2 transition-all ${
                tab === id ? 'border-emerald-800 text-emerald-800' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{id}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6">

        {/* TAB: Geografía */}
        {tab === 'Geografía' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={17} className="text-emerald-700" />
                <h2 className="text-base font-semibold text-gray-700">Sectores</h2>
              </div>
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Nombre del sector" value={nuevoSector}
                  onChange={(e) => setNuevoSector(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-700" />
                <button onClick={handleAddSector} disabled={cargando}
                  className="flex items-center gap-1 bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-900 disabled:opacity-50">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {sectores.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No hay sectores</p>}
                {sectores.map(sector => (
                  <div key={sector.id} onClick={() => setSectorSeleccionado(sector)}
                    className={`flex justify-between items-center p-3 rounded-xl cursor-pointer border transition-all ${
                      sectorSeleccionado?.id === sector.id ? 'border-emerald-700 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <span className="text-sm font-medium text-gray-700">{sector.nombre}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSector(sector.id) }}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={17} className="text-emerald-700" />
                <h2 className="text-base font-semibold text-gray-700">Pasillos</h2>
              </div>
              {sectorSeleccionado
                ? <p className="text-xs text-emerald-700 mb-4 ml-6">Sector: {sectorSeleccionado.nombre}</p>
                : <p className="text-xs text-gray-400 mb-4 ml-6">Seleccioná un sector</p>}
              {sectorSeleccionado && (
                <>
                  <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Número o nombre del pasillo" value={nuevoPasillo}
                      onChange={(e) => setNuevoPasillo(e.target.value)}
                      className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-700" />
                    <button onClick={handleAddPasillo} disabled={cargando}
                      className="flex items-center gap-1 bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-900 disabled:opacity-50">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {pasillos.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No hay pasillos</p>}
                    {pasillos.map(pasillo => (
                      <div key={pasillo.id} className="flex justify-between items-center p-3 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-700">Pasillo {pasillo.numero}</span>
                        <button onClick={() => handleDeletePasillo(pasillo.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-700">Comerciantes registrados</h2>
                <p className="text-xs text-gray-400">{comerciantes.length} comerciante{comerciantes.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setModalComerciante(true)}
                className="flex items-center gap-1.5 bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-900 transition-colors">
                <Plus size={16} />
                Nuevo
              </button>
            </div>
            {comerciantes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="text-gray-300 mb-2" size={36} />
                <p className="text-gray-400 text-sm">No hay comerciantes registrados</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {comerciantes.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Store size={16} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ESTADO_STYLES[c.estado] || 'bg-gray-100 text-gray-500'}`}>
                      {c.estado || 'cerrado'}
                    </span>
                    <button onClick={() => deleteComerciante(c.id).then(cargarComerciantes)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Auditoría */}
        {tab === 'Auditoría' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <History size={17} className="text-emerald-700" />
              <h2 className="text-base font-semibold text-gray-700">Log de auditoría</h2>
              <span className="text-xs text-gray-400 ml-1">últimos 50 registros</span>
            </div>
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <History className="text-gray-300 mb-2" size={36} />
                <p className="text-gray-400 text-sm">No hay registros todavía</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {logs.map(log => (
                <div key={log.id} className="p-3 border border-gray-100 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        {TIPO_LABELS[log.tipo] || log.tipo}
                      </span>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Valor: <span className="font-medium text-gray-700">{String(log.valorNuevo)}</span>
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Nuevo comerciante</h3>
              <button onClick={() => { setModalComerciante(false); setError('') }} className="text-gray-300 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Nombre completo" value={formComerciante.nombre}
                onChange={(e) => setFormComerciante({ ...formComerciante, nombre: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700" />
              <input type="email" placeholder="Email" value={formComerciante.email}
                onChange={(e) => setFormComerciante({ ...formComerciante, email: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700" />
              <input type="password" placeholder="Contraseña" value={formComerciante.password}
                onChange={(e) => setFormComerciante({ ...formComerciante, password: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700" />
              <select value={formComerciante.sectorId}
                onChange={async (e) => {
                  setFormComerciante({ ...formComerciante, sectorId: e.target.value, pasilloId: '' })
                  await cargarPasillosForm(e.target.value)
                }}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700">
                <option value="">Seleccioná un sector</option>
                {sectores.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
              <select value={formComerciante.pasilloId}
                onChange={(e) => setFormComerciante({ ...formComerciante, pasilloId: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                disabled={!formComerciante.sectorId}>
                <option value="">Seleccioná un pasillo</option>
                {pasillosForm.map(p => <option key={p.id} value={p.id}>Pasillo {p.numero}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setModalComerciante(false); setError('') }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleCrearComerciante} disabled={cargando}
                className="flex-1 bg-emerald-800 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-900 disabled:opacity-50">
                {cargando ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}