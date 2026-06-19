import { useState } from 'react'
import {
  Plus, Pencil, Trash2, Package,
  Search, X, Tag, AlertTriangle, Minus
} from 'lucide-react'
import ComboBox from '../ComboBox'

const FORM_INICIAL = {
  nombre: '', precio: '', categoriaId: '', categoriaNombre: '',
  marcaId: '', marcaNombre: '', stock: 0, stockMinimo: 1,
}

export default function TabCatalogo({
  productos, marcas, categoriasProducto,
  onGuardar, onEliminar, onAjusteStock,
  onCrearCategoria, onCrearMarca
}) {
  const [busqueda, setBusqueda]         = useState('')
  const [filtroCat, setFiltroCat]       = useState('')
  const [modalProducto, setModalProducto] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [form, setForm]                 = useState(FORM_INICIAL)

  const productosFiltrados = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCat    = filtroCat ? p.categoriaId === filtroCat : true
    return coincideNombre && coincideCat
  })

  const abrirModalNuevo = () => {
    setProductoEditando(null)
    setForm(FORM_INICIAL)
    setModalProducto(true)
  }

  const abrirModalEditar = (p) => {
    setProductoEditando(p)
    setForm({
      nombre:          p.nombre          || '',
      precio:          p.precio          || '',
      categoriaId:     p.categoriaId     || '',
      categoriaNombre: p.categoriaNombre || '',
      marcaId:         p.marcaId         || '',
      marcaNombre:     p.marcaNombre     || '',
      stock:           p.stock           ?? 0,
      stockMinimo:     p.stockMinimo     ?? 1,
    })
    setModalProducto(true)
  }

  const handleGuardar = async () => {
    if (!form.nombre.trim() || !form.precio) return
    const datos = {
      nombre:          form.nombre.trim(),
      precio:          parseFloat(form.precio),
      categoriaId:     form.categoriaId,
      categoriaNombre: form.categoriaNombre,
      marcaId:         form.marcaId,
      marcaNombre:     form.marcaNombre,
      stock:           parseInt(form.stock)     || 0,
      stockMinimo:     parseInt(form.stockMinimo) || 1,
    }
    await onGuardar(datos, productoEditando?.id || null)
    setModalProducto(false)
  }

  const stockColor = (p) => {
    if (p.stock <= 0)             return 'bg-red-50 text-red-600'
    if (p.stock <= p.stockMinimo) return 'bg-yellow-50 text-yellow-600'
    return 'bg-emerald-50 text-emerald-700'
  }

  const stockLabel = (p) => {
    if (p.stock <= 0) return 'Sin stock'
    return `${p.stock} en stock`
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">

      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-700">Mi catálogo</h2>
          <p className="text-xs text-gray-400">
            {productosFiltrados.length} de {productos.length} producto{productos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="flex items-center gap-1.5 bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-900 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
        {busqueda && (
          <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Chips de categoría */}
      {categoriasProducto.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setFiltroCat('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border
              ${filtroCat === '' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-700 hover:text-emerald-700'}`}
          >
            Todos
          </button>
          {categoriasProducto.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFiltroCat(filtroCat === cat.id ? '' : cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border
                ${filtroCat === cat.id ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-700 hover:text-emerald-700'}`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Lista vacía */}
      {productos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Package className="text-gray-300 mb-2" size={36} />
          <p className="text-gray-400 text-sm">No tenés productos todavía</p>
        </div>
      )}

      {productos.length > 0 && productosFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Search className="text-gray-300 mb-2" size={36} />
          <p className="text-gray-400 text-sm">No se encontraron productos</p>
          <button
            onClick={() => { setBusqueda(''); setFiltroCat('') }}
            className="text-xs text-emerald-700 mt-2 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Lista de productos */}
      <div className="flex flex-col gap-2">
        {productosFiltrados.map(p => (
          <div key={p.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{p.nombre}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                {p.categoriaNombre && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Tag size={10} />{p.categoriaNombre}
                  </span>
                )}
                {p.marcaNombre && (
                  <><span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-500">{p.marcaNombre}</span></>
                )}
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs font-semibold text-emerald-700">Bs. {p.precio}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${stockColor(p)}`}>
                  {p.stock <= p.stockMinimo && p.stock > 0 && <AlertTriangle size={10} className="inline mr-0.5" />}
                  {stockLabel(p)}
                </span>
              </div>
            </div>
            <div className="flex gap-1 ml-2">
              <button onClick={() => onAjusteStock(p, -1)} disabled={p.stock <= 0}
                className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-30" title="Restar 1">
                <Minus size={15} />
              </button>
              <button onClick={() => onAjusteStock(p, 1)}
                className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors" title="Sumar 1">
                <Plus size={15} />
              </button>
              <button onClick={() => abrirModalEditar(p)}
                className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => onEliminar(p.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Producto */}
      {modalProducto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {productoEditando ? 'Editar producto' : 'Nuevo producto'}
            </h3>
            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Nombre del producto" value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700" />
              <input type="number" placeholder="Precio en Bs." value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700" />
              <ComboBox label="Categoría" opciones={categoriasProducto}
                valor={form.categoriaId} nombreValor={form.categoriaNombre}
                onChange={op => setForm({ ...form, categoriaId: op?.id || '', categoriaNombre: op?.nombre || '' })}
                onCrear={onCrearCategoria} />
              <ComboBox label="Marca" opciones={marcas}
                valor={form.marcaId} nombreValor={form.marcaNombre}
                onChange={op => setForm({ ...form, marcaId: op?.id || '', marcaNombre: op?.nombre || '' })}
                onCrear={onCrearMarca} />
              <div>
                <label className="text-xs text-gray-500 mb-1 block pl-1">Cantidad en stock</label>
                <input type="number" min="0" value={form.stock}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-700" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block pl-1">Stock mínimo (alerta)</label>
                <input type="number" min="0" value={form.stockMinimo}
                  onChange={e => setForm({ ...form, stockMinimo: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-700" />
                <p className="text-xs text-gray-400 mt-1 pl-1">Alerta cuando el stock baje de este número</p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModalProducto(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={!form.nombre.trim() || !form.precio}
                className="flex-1 bg-emerald-800 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-900 disabled:opacity-50">
                {productoEditando ? 'Guardar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}