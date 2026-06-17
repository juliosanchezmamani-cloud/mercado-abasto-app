import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuth'
import { escucharPuestos, buscarProductos, getSectoresMap, getProductosDePuesto } from '../services/clienteService'
import {
  Store, Search, ShoppingCart, MapPin, ArrowLeft,
  LogIn, Plus, X, PackageX, CheckCircle2, PauseCircle, XCircle
} from 'lucide-react'

const CATEGORIAS = ['Todas', 'Aseo personal', 'Limpieza hogar', 'Alimentos', 'Bebidas', 'Otro']

const SEMAFORO = {
  abierto: { color: 'bg-green-500', texto: 'Abierto', textoColor: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
  pausa: { color: 'bg-yellow-400', texto: 'En pausa', textoColor: 'text-yellow-600', bg: 'bg-yellow-50', icon: PauseCircle },
  cerrado: { color: 'bg-red-500', texto: 'Cerrado', textoColor: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
}

export default function InicioScreen() {
  const { usuario, rol, cargando } = useAuthStore()
  const navigate = useNavigate()

  const [puestos, setPuestos] = useState([])
  const [mapaUbicaciones, setMapaUbicaciones] = useState({})
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [listado, setListado] = useState([])
  const [vistaLista, setVistaLista] = useState(false)
  const [puestoDetalle, setPuestoDetalle] = useState(null)

  useEffect(() => {
    if (!cargando && rol) {
      if (rol === 'admin') navigate('/admin', { replace: true })
      else if (rol === 'comerciante') navigate('/comerciante', { replace: true })
    }
  }, [cargando, rol, navigate])

  useEffect(() => {
    const unsub = escucharPuestos((data) => setPuestos(data))
    getSectoresMap().then(setMapaUbicaciones)
    return () => unsub()
  }, [])

  const handleBuscar = async () => {
    if (!busqueda.trim() && categoria === 'Todas') return
    setBuscando(true)
    const data = await buscarProductos(busqueda.trim(), categoria)
    setResultados(data)
    setBuscando(false)
  }

  const agregarALista = (producto) => {
    const yaEsta = listado.find(p => p.id === producto.id && p.puestoId === producto.puestoId)
    if (!yaEsta) setListado([...listado, producto])
  }

  const quitarDeLista = (productoId, puestoId) => {
    setListado(listado.filter(p => !(p.id === productoId && p.puestoId === puestoId)))
  }

  const listadoPorPuesto = listado.reduce((acc, p) => {
    if (!acc[p.puestoId]) acc[p.puestoId] = { nombre: p.puestoNombre, productos: [] }
    acc[p.puestoId].productos.push(p)
    return acc
  }, {})

  const ubicacionTexto = (puesto) => {
    const partes = []
    if (puesto.sectorId && mapaUbicaciones[puesto.sectorId]) partes.push(mapaUbicaciones[puesto.sectorId])
    if (puesto.pasilloId && mapaUbicaciones[`pasillo_${puesto.pasilloId}`]) partes.push(`Pasillo ${mapaUbicaciones[`pasillo_${puesto.pasilloId}`]}`)
    return partes.join(' · ')
  }

  // ── Header reutilizable ──
  const Header = ({ titulo, volver }) => (
    <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {volver ? (
          <button onClick={volver} className="p-2 -ml-2 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="bg-emerald-800 p-2 rounded-xl">
            <Store className="text-white" size={20} />
          </div>
        )}
        <h1 className="text-lg font-bold text-gray-800">{titulo}</h1>
      </div>
      {!volver && (
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/login')} className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-800 text-sm font-medium transition-colors px-2">
            <LogIn size={16} />
            <span className="hidden sm:inline">Ingresar</span>
          </button>
          <button
            onClick={() => setVistaLista(true)}
            className="relative flex items-center gap-1.5 bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-900 transition-colors shadow-sm"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Mi lista</span>
            {listado.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {listado.length}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )

  // ── VISTA: Lista de compras ──
  if (vistaLista) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header titulo="Mi lista de compras" volver={() => setVistaLista(false)} />
        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          {listado.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="text-gray-300 mb-3" size={40} />
              <p className="text-gray-400 text-sm">Tu lista está vacía</p>
              <p className="text-gray-400 text-xs mt-1">Buscá productos y agregalos desde aquí</p>
            </div>
          ) : (
            Object.entries(listadoPorPuesto).map(([puestoId, puesto]) => (
              <div key={puestoId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Store size={15} className="text-emerald-700" />
                  <h2 className="font-semibold text-gray-700 text-sm">{puesto.nombre}</h2>
                </div>
                {puesto.productos.map(p => (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm text-gray-800">{p.nombre}</p>
                      <p className="text-xs font-semibold text-emerald-700">Bs. {p.precio}</p>
                    </div>
                    <button
                      onClick={() => quitarDeLista(p.id, puestoId)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // ── VISTA: Detalle de puesto ──
  if (puestoDetalle) {
    const sem = SEMAFORO[puestoDetalle.estado] || SEMAFORO.cerrado
    const SemIcon = sem.icon
    return (
      <div className="min-h-screen bg-gray-50">
        <Header titulo={puestoDetalle.nombre || 'Puesto'} volver={() => setPuestoDetalle(null)} />
        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          <div className={`flex items-center gap-2 mb-2 p-3 rounded-xl ${sem.bg}`}>
            <SemIcon size={18} className={sem.textoColor} />
            <span className={`text-sm font-medium ${sem.textoColor}`}>
              {sem.texto}
              {puestoDetalle.estado === 'pausa' && puestoDetalle.mensajePausa && ` — ${puestoDetalle.mensajePausa}`}
            </span>
          </div>
          {ubicacionTexto(puestoDetalle) && (
            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-4 px-1">
              <MapPin size={13} />
              {ubicacionTexto(puestoDetalle)}
            </div>
          )}

          {puestoDetalle.productos?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PackageX className="text-gray-300 mb-2" size={36} />
              <p className="text-gray-400 text-sm">Este puesto no tiene productos cargados</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {puestoDetalle.productos?.map(p => (
                <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{p.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">{p.categoria}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs font-semibold text-emerald-700">Bs. {p.precio}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.enStock ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                        {p.enStock ? 'En stock' : 'Sin stock'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => agregarALista({ ...p, puestoId: puestoDetalle.id, puestoNombre: puestoDetalle.nombre, puestoEstado: puestoDetalle.estado })}
                    className="flex items-center gap-1 bg-emerald-800 text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-emerald-900 transition-colors shrink-0"
                  >
                    <Plus size={14} />
                    Lista
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── VISTA: Principal ──
  return (
    <div className="min-h-screen bg-gray-50">
      <Header titulo="Mercado Abasto" />

      <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">

        {/* para buscarrrr */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all"
              />
            </div>
            <button
              onClick={handleBuscar}
              disabled={buscando}
              className="bg-emerald-800 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-emerald-900 disabled:opacity-50 transition-colors shadow-sm"
            >
              {buscando ? '...' : 'Buscar'}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIAS.map(c => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  categoria === c
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        
        {/* Resultadooo busqueda */}
        {busqueda.trim() !== '' && !buscando && resultados.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <Search className="text-gray-300 mb-2" size={36} />
            <p className="text-gray-500 text-sm font-medium">Sin resultados para "{busqueda}"</p>
            <p className="text-gray-400 text-xs mt-1">Probá con otro nombre o categoría</p>
          </div>
        )}
        {resultados.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
            </h2>
            <div className="flex flex-col gap-1">
              {resultados.map((p) => {
                const sem = SEMAFORO[p.puestoEstado] || SEMAFORO.cerrado
                return (
                  <div key={`${p.puestoId}-${p.id}`} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.nombre}</p>
                      <p className="text-xs text-gray-500">Bs. {p.precio} · {p.puestoNombre}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-2 h-2 rounded-full ${sem.color}`} />
                        <span className={`text-xs ${sem.textoColor}`}>
                          {sem.texto}
                          {p.puestoEstado === 'pausa' && p.puestoMensaje && ` — ${p.puestoMensaje}`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => agregarALista(p)}
                      className="flex items-center gap-1 bg-emerald-800 text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-emerald-900 transition-colors shrink-0"
                    >
                      <Plus size={14} />
                      Lista
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Puestos del mercado */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-1">
            Puestos del mercado
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {puestos.map((puesto) => {
              const sem = SEMAFORO[puesto.estado] || SEMAFORO.cerrado
              return (
                <div
                  key={puesto.id}
                  onClick={async () => {
                    const productos = await getProductosDePuesto(puesto.id)
                    setPuestoDetalle({ ...puesto, productos })
                  }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{puesto.nombre || 'Sin nombre'}</p>
                      {ubicacionTexto(puesto) && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                          <MapPin size={12} />
                          {ubicacionTexto(puesto)}
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-1.5 ${sem.bg} px-2.5 py-1 rounded-full shrink-0`}>
                      <div className={`w-2 h-2 rounded-full ${sem.color}`} />
                      <span className={`text-xs font-medium ${sem.textoColor}`}>{sem.texto}</span>
                    </div>
                  </div>
                  {puesto.estado === 'pausa' && puesto.mensajePausa && (
                    <p className="text-xs text-yellow-600 mt-2 bg-yellow-50 px-2 py-1 rounded-lg inline-block">{puesto.mensajePausa}</p>
                  )}
                </div>
              )
            })}
          </div>
          {puestos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Store className="text-gray-300 mb-2" size={36} />
              <p className="text-gray-400 text-sm">No hay puestos registrados todavía</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}