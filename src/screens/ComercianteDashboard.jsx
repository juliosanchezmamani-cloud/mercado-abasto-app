import { useState, useEffect } from 'react'
import { useAuthStore } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import {
  escucharEstadoComercante,
  actualizarEstado,
  getProductos,
  addProducto,
  updateProducto,
  deleteProducto
} from '../services/comercianteService'
import {
  Store, LogOut, Plus, Pencil, Trash2,
  CheckCircle2, PauseCircle, XCircle, Clock, Package
} from 'lucide-react'

const ESTADOS = [
  { valor: 'abierto', label: 'Abierto', color: 'bg-green-500', hover: 'hover:bg-green-600', icon: CheckCircle2 },
  { valor: 'pausa', label: 'Pausa', color: 'bg-yellow-400', hover: 'hover:bg-yellow-500', icon: PauseCircle },
  { valor: 'cerrado', label: 'Cerrado', color: 'bg-red-500', hover: 'hover:bg-red-600', icon: XCircle },
]

const CATEGORIAS = ['Aseo personal', 'Limpieza hogar', 'Alimentos', 'Bebidas', 'Otro']

const SEMAFORO_INFO = {
  abierto: { color: 'bg-green-500', texto: 'Abierto', textoColor: 'text-green-600' },
  pausa: { color: 'bg-yellow-400', texto: 'En pausa', textoColor: 'text-yellow-600' },
  cerrado: { color: 'bg-red-500', texto: 'Cerrado', textoColor: 'text-red-600' },
}

export default function ComercianteDashboard() {
  const { usuario, cerrarSesion } = useAuthStore()
  const navigate = useNavigate()

  const [datosComercante, setDatosComercante] = useState(null)
  const [productos, setProductos] = useState([])
  const [modalPausa, setModalPausa] = useState(false)
  const [mensajePausa, setMensajePausa] = useState('')
  const [modalProducto, setModalProducto] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [form, setForm] = useState({
    nombre: '', precio: '', categoria: 'Aseo personal', enStock: true
  })

  useEffect(() => {
    if (!usuario) return
    const unsub = escucharEstadoComercante(usuario.uid, (data) => {
      setDatosComercante(data)
    })
    cargarProductos()
    return () => unsub()
  }, [usuario])

  const cargarProductos = async () => {
    const data = await getProductos(usuario.uid)
    setProductos(data)
  }

  const handleCambiarEstado = async (estado) => {
    if (estado === 'pausa') {
      setModalPausa(true)
      return
    }
    await actualizarEstado(usuario.uid, estado)
  }

  const confirmarPausa = async () => {
    if (!mensajePausa.trim()) return
    await actualizarEstado(usuario.uid, 'pausa', mensajePausa.trim())
    setModalPausa(false)
    setMensajePausa('')
  }

  const abrirModalNuevo = () => {
    setProductoEditando(null)
    setForm({ nombre: '', precio: '', categoria: 'Aseo personal', enStock: true })
    setModalProducto(true)
  }

  const abrirModalEditar = (producto) => {
    setProductoEditando(producto)
    setForm({
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      enStock: producto.enStock
    })
    setModalProducto(true)
  }

  const guardarProducto = async () => {
    if (!form.nombre.trim() || !form.precio) return
    const datos = {
      nombre: form.nombre.trim(),
      precio: parseFloat(form.precio),
      categoria: form.categoria,
      enStock: form.enStock
    }
    if (productoEditando) {
      await updateProducto(usuario.uid, productoEditando.id, datos)
    } else {
      await addProducto(usuario.uid, datos)
    }
    setModalProducto(false)
    await cargarProductos()
  }

  const handleEliminar = async (id) => {
    await deleteProducto(usuario.uid, id)
    await cargarProductos()
  }

  const handleLogout = async () => {
    await cerrarSesion()
    navigate('/login')
  }

  const estadoActual = datosComercante?.estado || 'cerrado'
  const semaforo = SEMAFORO_INFO[estadoActual]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-800 p-2 rounded-xl">
            <Store className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">Mi Tienda</h1>
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

      <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">

        {/* Semáforo */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 mb-1">Estado de mi tienda</h2>
          <p className="text-xs text-gray-400 mb-4">
            Tus clientes ven este estado en tiempo real
          </p>

          {estadoActual === 'pausa' && datosComercante?.mensajePausa && (
            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 text-sm px-3 py-2 rounded-xl mb-4 border border-yellow-100">
              <Clock size={15} />
              {datosComercante.mensajePausa}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {ESTADOS.map((e) => {
              const Icon = e.icon
              const activo = estadoActual === e.valor
              return (
                <button
                  key={e.valor}
                  onClick={() => handleCambiarEstado(e.valor)}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-xl text-white font-semibold text-sm ${e.color} ${e.hover} transition-all ${
                    activo ? 'ring-3 ring-offset-2 ring-gray-300 scale-[1.03]' : 'opacity-80'
                  }`}
                >
                  <Icon size={22} />
                  {e.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Catálogo */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-700">Mi catálogo</h2>
              <p className="text-xs text-gray-400">{productos.length} producto{productos.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={abrirModalNuevo}
              className="flex items-center gap-1.5 bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-900 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Agregar
            </button>
          </div>

          {productos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Package className="text-gray-300 mb-2" size={36} />
              <p className="text-gray-400 text-sm">No tenés productos todavía</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {productos.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.nombre}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{p.categoria}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs font-semibold text-emerald-700">Bs. {p.precio}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      p.enStock ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {p.enStock ? 'En stock' : 'Sin stock'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => abrirModalEditar(p)}
                    className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleEliminar(p.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Pausa */}
      {modalPausa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <PauseCircle className="text-yellow-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">¿A qué hora volvés?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Este mensaje será visible para los clientes
            </p>
            <input
              type="text"
              placeholder="Ej: Vuelvo a las 3pm"
              value={mensajePausa}
              onChange={(e) => setMensajePausa(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setModalPausa(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPausa}
                disabled={!mensajePausa.trim()}
                className="flex-1 bg-yellow-400 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-yellow-500 disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Producto */}
      {modalProducto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {productoEditando ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <input
                type="number"
                placeholder="Precio en Bs."
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer px-1">
                <input
                  type="checkbox"
                  checked={form.enStock}
                  onChange={(e) => setForm({ ...form, enStock: e.target.checked })}
                  className="w-4 h-4 accent-emerald-700"
                />
                En stock
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setModalProducto(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarProducto}
                disabled={!form.nombre.trim() || !form.precio}
                className="flex-1 bg-emerald-800 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-900 disabled:opacity-50"
              >
                {productoEditando ? 'Guardar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}