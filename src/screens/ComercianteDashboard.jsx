import { useState, useEffect } from 'react'
import { useAuthStore } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  escucharEstadoComercante, actualizarEstado,
  getProductos, addProducto, updateProducto, deleteProducto,
  getMarcas, getCategoriasProducto,
  crearCategoria, crearMarca,
  registrarVentaMultiple, ajustarStock,
  getMovimientos, getVentasHoy
} from '../services/comercianteService'
import {
  Store, LogOut, Home, Package, ShoppingCart, Clock, PauseCircle
} from 'lucide-react'
import TabInicio    from '../components/comerciante/TabInicio'
import TabCatalogo  from '../components/comerciante/TabCatalogo'
import TabVentas    from '../components/comerciante/TabVentas'
import TabHistorial from '../components/comerciante/TabHistorial'

const TABS = [
  { id: 'inicio',    label: 'Inicio',    icon: Home },
  { id: 'catalogo',  label: 'Catálogo',  icon: Package },
  { id: 'ventas',    label: 'Ventas',    icon: ShoppingCart },
  { id: 'historial', label: 'Historial', icon: Clock },
]

const SEMAFORO_INFO = {
  abierto: { color: 'bg-green-500',  texto: 'Abierto',  textoColor: 'text-green-600' },
  pausa:   { color: 'bg-yellow-400', texto: 'En pausa', textoColor: 'text-yellow-600' },
  cerrado: { color: 'bg-red-500',    texto: 'Cerrado',  textoColor: 'text-red-600' },
}

export default function ComercianteDashboard() {
  const { usuario, cerrarSesion } = useAuthStore()
  const navigate = useNavigate()

  const [tabActiva, setTabActiva]               = useState('inicio')
  const [datosComercante, setDatosComercante]   = useState(null)
  const [productos, setProductos]               = useState([])
  const [marcas, setMarcas]                     = useState([])
  const [categoriasProducto, setCategoriasProducto] = useState([])
  const [movimientos, setMovimientos]           = useState([])
  const [ventasHoy, setVentasHoy]               = useState([])
  const [modalPausa, setModalPausa]             = useState(false)
  const [mensajePausa, setMensajePausa]         = useState('')

  useEffect(() => {
    if (!usuario) return
    const unsub = escucharEstadoComercante(usuario.uid, setDatosComercante)
    cargarTodo()
    return () => unsub()
  }, [usuario])

  const cargarTodo = async () => {
    const [prods, mrcas, cats, movs, ventas] = await Promise.all([
      getProductos(usuario.uid),
      getMarcas(),
      getCategoriasProducto(),
      getMovimientos(usuario.uid),
      getVentasHoy(usuario.uid),
    ])
    setProductos(prods)
    setMarcas(mrcas)
    setCategoriasProducto(cats)
    setMovimientos(movs)
    setVentasHoy(ventas)
  }

  // ─── Semáforo ──────────────────────────────────────────────
  const handleCambiarEstado = async (estado) => {
    if (estado === 'pausa') { setModalPausa(true); return }
    await actualizarEstado(usuario.uid, estado)
  }

  const confirmarPausa = async () => {
    if (!mensajePausa.trim()) return
    await actualizarEstado(usuario.uid, 'pausa', mensajePausa.trim())
    setModalPausa(false)
    setMensajePausa('')
  }

  // ─── Catálogo ──────────────────────────────────────────────
  const handleGuardarProducto = async (datos, productoId) => {
    if (productoId) {
      await updateProducto(usuario.uid, productoId, datos)
    } else {
      await addProducto(usuario.uid, datos)
    }
    await cargarTodo()
  }

  const handleEliminarProducto = async (id) => {
    await deleteProducto(usuario.uid, id)
    await cargarTodo()
  }

  const handleAjusteStock = async (producto, delta) => {
    const nuevoStock = Math.max(0, (producto.stock || 0) + delta)
    await ajustarStock(usuario.uid, producto.id, nuevoStock, producto.stock)
    await cargarTodo()
  }

  const handleCrearCategoria = async (nombre) => {
    if (!nombre) return
    const creada = await crearCategoria(nombre)
    setCategoriasProducto(prev => [...prev, creada])
    return creada
  }

  const handleCrearMarca = async (nombre) => {
    if (!nombre) return
    const creada = await crearMarca(nombre)
    setMarcas(prev => [...prev, creada])
    return creada
  }

  // ─── Ventas ────────────────────────────────────────────────
  const handleConfirmarVenta = async (items) => {
    await registrarVentaMultiple(usuario.uid, items)
    await cargarTodo()
  }

  const handleLogout = async () => {
    await cerrarSesion()
    navigate('/login')
  }

  const estadoActual = datosComercante?.estado || 'cerrado'
  const semaforo     = SEMAFORO_INFO[estadoActual]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-800 p-2 rounded-xl">
            <Store className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">
              {datosComercante?.nombre || 'Mi Tienda'}
            </h1>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${semaforo.color}`} />
              <span className={`text-xs font-medium ${semaforo.textoColor}`}>
                {semaforo.texto}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-[73px] z-10">
        <div className="max-w-4xl mx-auto px-4 flex">
          {TABS.map(tab => {
            const Icon = tab.icon
            const activa = tabActiva === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors
                  ${activa
                    ? 'border-emerald-700 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {tabActiva === 'inicio' && (
          <TabInicio
            datosComercante={datosComercante}
            estadoActual={estadoActual}
            onCambiarEstado={handleCambiarEstado}
            productos={productos}
            ventasHoy={ventasHoy}
          />
        )}
        {tabActiva === 'catalogo' && (
          <TabCatalogo
            productos={productos}
            marcas={marcas}
            categoriasProducto={categoriasProducto}
            onGuardar={handleGuardarProducto}
            onEliminar={handleEliminarProducto}
            onAjusteStock={handleAjusteStock}
            onCrearCategoria={handleCrearCategoria}
            onCrearMarca={handleCrearMarca}
          />
        )}
        {tabActiva === 'ventas' && (
          <TabVentas
            productos={productos}
            categoriasProducto={categoriasProducto}
            ventasHoy={ventasHoy}
            onConfirmarVenta={handleConfirmarVenta}
          />
        )}
        {tabActiva === 'historial' && (
          <TabHistorial movimientos={movimientos} />
        )}
      </div>

      {/* Modal Pausa */}
      {modalPausa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <PauseCircle className="text-yellow-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">¿A qué hora volvés?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Este mensaje será visible para los clientes</p>
            <input
              type="text"
              placeholder="Ej: Vuelvo a las 3pm"
              value={mensajePausa}
              onChange={e => setMensajePausa(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setModalPausa(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={confirmarPausa} disabled={!mensajePausa.trim()}
                className="flex-1 bg-yellow-400 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-yellow-500 disabled:opacity-50">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}