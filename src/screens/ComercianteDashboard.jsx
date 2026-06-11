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

const ESTADOS = [
  { valor: 'abierto', label: 'Abierto', color: 'bg-green-500', hover: 'hover:bg-green-600' },
  { valor: 'pausa', label: 'Pausa', color: 'bg-yellow-400', hover: 'hover:bg-yellow-500' },
  { valor: 'cerrado', label: 'Cerrado', color: 'bg-red-500', hover: 'hover:bg-red-600' },
]

const CATEGORIAS = ['Aseo personal', 'Limpieza hogar', 'Alimentos', 'Bebidas', 'Otro']

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
  const colorSemaforo = {
    abierto: 'bg-green-500',
    pausa: 'bg-yellow-400',
    cerrado: 'bg-red-500'
  }[estadoActual]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full ${colorSemaforo} shadow-md`} />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mi Tienda</h1>
            <p className="text-xs font-medium capitalize" style={{
              color: estadoActual === 'abierto' ? '#16a34a' :
                     estadoActual === 'pausa' ? '#ca8a04' : '#dc2626'
            }}>
              {estadoActual === 'pausa' ? `En pausa` : estadoActual}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">

        {/* Semáforo */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Estado de mi tienda</h2>
          {estadoActual === 'pausa' && datosComercante?.mensajePausa && (
            <p className="text-sm text-yellow-600 mb-3">
              Mensaje: {datosComercante.mensajePausa}
            </p>
          )}
          <div className="flex gap-3 mt-4">
            {ESTADOS.map((e) => (
              <button
                key={e.valor}
                onClick={() => handleCambiarEstado(e.valor)}
                className={`flex-1 py-4 rounded-xl text-white font-semibold text-sm ${e.color} ${e.hover} transition-all ${
                  estadoActual === e.valor ? 'ring-4 ring-offset-2 ring-gray-400 scale-105' : ''
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catálogo */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Mi catálogo</h2>
            <button
              onClick={abrirModalNuevo}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              + Agregar producto
            </button>
          </div>

          {productos.length === 0 && (
            <p className="text-gray-400 text-sm">No tenés productos todavía</p>
          )}

          <div className="flex flex-col gap-2">
            {productos.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {p.categoria} · Bs. {p.precio} · {p.enStock ? '✅ En stock' : '❌ Sin stock'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModalEditar(p)}
                    className="text-blue-500 hover:text-blue-700 text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(p.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Pausa */}
      {modalPausa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">¿A qué hora volvés?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Este mensaje será visible para los clientes
            </p>
            <input
              type="text"
              placeholder="Ej: Vuelvo a las 3pm"
              value={mensajePausa}
              onChange={(e) => setMensajePausa(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setModalPausa(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarPausa}
                disabled={!mensajePausa.trim()}
                className="flex-1 bg-yellow-400 text-white py-2 rounded-lg text-sm hover:bg-yellow-500 disabled:opacity-50"
              >
                Confirmar pausa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Producto */}
      {modalProducto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {productoEditando ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Precio en Bs."
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enStock}
                  onChange={(e) => setForm({ ...form, enStock: e.target.checked })}
                  className="w-4 h-4 accent-green-600"
                />
                En stock
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setModalProducto(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarProducto}
                disabled={!form.nombre.trim() || !form.precio}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {productoEditando ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}