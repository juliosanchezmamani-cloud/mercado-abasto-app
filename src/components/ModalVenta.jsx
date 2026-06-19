import { useState, useMemo } from 'react'
import {
  ShoppingCart, Search, X, Plus, Minus,
  Tag, Trash2, CheckCircle2
} from 'lucide-react'

export default function ModalVenta({ productos, categorias, onConfirmar, onCerrar }) {
  const [busqueda, setBusqueda]     = useState('')
  const [filtroCat, setFiltroCat]   = useState('')
  const [items, setItems]           = useState([])   // [{ producto, cantidad }]
  const [guardando, setGuardando]   = useState(false)
  const [confirmado, setConfirmado] = useState(false)

  // ─── Productos disponibles (con stock > 0, no en el carrito aún) ───
  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const enCarrito     = items.find(i => i.producto.id === p.id)
      const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      const coincideCat    = filtroCat ? p.categoriaId === filtroCat : true
      return !enCarrito && coincideNombre && coincideCat && p.stock > 0
    })
  }, [productos, items, busqueda, filtroCat])

  // ─── Carrito ────────────────────────────────────────────────
  const agregarProducto = (producto) => {
    setItems(prev => [...prev, { producto, cantidad: 1 }])
    setBusqueda('')
  }

  const cambiarCantidad = (productoId, delta) => {
    setItems(prev => prev.map(item => {
      if (item.producto.id !== productoId) return item
      const nueva = item.cantidad + delta
      if (nueva <= 0) return item
      if (nueva > item.producto.stock) return item
      return { ...item, cantidad: nueva }
    }))
  }

  const setCantidadDirecta = (productoId, valor) => {
    const num = parseInt(valor) || 1
    setItems(prev => prev.map(item => {
      if (item.producto.id !== productoId) return item
      const nueva = Math.min(Math.max(1, num), item.producto.stock)
      return { ...item, cantidad: nueva }
    }))
  }

  const quitarItem = (productoId) => {
    setItems(prev => prev.filter(i => i.producto.id !== productoId))
  }

  // ─── Totales ────────────────────────────────────────────────
  const totalBs    = items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0)
  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0)

  // ─── Confirmar ──────────────────────────────────────────────
  const handleConfirmar = async () => {
    if (items.length === 0) return
    setGuardando(true)
    await onConfirmar(items)
    setGuardando(false)
    setConfirmado(true)
    setTimeout(() => onCerrar(), 1500)
  }

  // ─── UI: pantalla de éxito ──────────────────────────────────
  if (confirmado) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm flex flex-col items-center text-center">
          <div className="bg-emerald-100 p-4 rounded-full mb-4">
            <CheckCircle2 className="text-emerald-600" size={36} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">¡Venta registrada!</h3>
          <p className="text-sm text-gray-500">
            {totalItems} producto{totalItems !== 1 ? 's' : ''} · Bs. {totalBs.toFixed(2)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header del modal */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Nueva venta</h3>
          </div>
          <button
            onClick={onCerrar}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Buscador de productos */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Agregar producto</p>

            {/* Chips de categoría */}
            {categorias.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-2">
                <button
                  onClick={() => setFiltroCat('')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border
                    ${filtroCat === ''
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-700 hover:text-emerald-700'
                    }`}
                >
                  Todos
                </button>
                {categorias.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFiltroCat(filtroCat === cat.id ? '' : cat.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border
                      ${filtroCat === cat.id
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-700 hover:text-emerald-700'
                      }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            )}

            {/* Input de búsqueda */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Lista de resultados */}
            {(busqueda || filtroCat) && (
              <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {productosFiltrados.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No se encontraron productos disponibles
                  </p>
                ) : (
                  productosFiltrados.map(p => (
                    <button
                      key={p.id}
                      onClick={() => agregarProducto(p)}
                      className="w-full flex justify-between items-center px-4 py-2.5 hover:bg-emerald-50 transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <p className="text-sm text-gray-800 font-medium">{p.nombre}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {p.categoriaNombre && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Tag size={9} />
                              {p.categoriaNombre}
                            </span>
                          )}
                          {p.marcaNombre && (
                            <span className="text-xs text-gray-400">· {p.marcaNombre}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <p className="text-sm font-semibold text-emerald-700">Bs. {p.precio}</p>
                        <p className="text-xs text-gray-400">{p.stock} disponibles</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Carrito */}
          {items.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">
                Productos en esta venta
              </p>
              <div className="flex flex-col gap-2">
                {items.map(({ producto, cantidad }) => (
                  <div
                    key={producto.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {producto.nombre}
                      </p>
                      <p className="text-xs text-emerald-700 font-semibold">
                        Bs. {(producto.precio * cantidad).toFixed(2)}
                        <span className="text-gray-400 font-normal ml-1">
                          ({cantidad} × {producto.precio})
                        </span>
                      </p>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => cambiarCantidad(producto.id, -1)}
                        disabled={cantidad <= 1}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white disabled:opacity-30 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        value={cantidad}
                        onChange={e => setCantidadDirecta(producto.id, e.target.value)}
                        className="w-10 text-center text-sm font-semibold border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                      <button
                        onClick={() => cambiarCantidad(producto.id, 1)}
                        disabled={cantidad >= producto.stock}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-white disabled:opacity-30 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Quitar */}
                    <button
                      onClick={() => quitarItem(producto.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {items.length === 0 && !busqueda && !filtroCat && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingCart className="text-gray-200 mb-2" size={36} />
              <p className="text-sm text-gray-400">
                Busca un producto para agregarlo a la venta
              </p>
            </div>
          )}
        </div>

        {/* Footer con total y confirmar */}
        <div className="border-t border-gray-100 px-5 py-4">
          {items.length > 0 && (
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs text-gray-400">
                  {totalItems} producto{totalItems !== 1 ? 's' : ''}
                </p>
                <p className="text-lg font-bold text-gray-800">
                  Total: Bs. {totalBs.toFixed(2)}
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={onCerrar}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmar}
              disabled={items.length === 0 || guardando}
              className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-40 transition-colors"
            >
              {guardando ? 'Registrando...' : `Confirmar venta`}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}