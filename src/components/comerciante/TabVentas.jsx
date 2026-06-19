import { useState } from 'react'
import { ShoppingCart, TrendingUp, Package } from 'lucide-react'
import ModalVenta from '../ModalVenta'

export default function TabVentas({ productos, categoriasProducto, ventasHoy, onConfirmarVenta }) {
  const [modalVenta, setModalVenta] = useState(false)

  const totalHoy = ventasHoy.reduce((acc, v) => {
    const prod = productos.find(p => p.id === v.productoId)
    return prod ? acc + (prod.precio * Math.abs(v.cantidad)) : acc
  }, 0)

  // Agrupar ventas del día por venta (mismo timestamp aprox)
  const ventasAgrupadas = ventasHoy.reduce((acc, v) => {
    const prod = productos.find(p => p.id === v.productoId)
    if (!prod) return acc
    const key = v.fecha?.seconds || v.productoId
    if (!acc[key]) acc[key] = { fecha: v.fecha, items: [] }
    acc[key].items.push({ nombre: prod.nombre, cantidad: Math.abs(v.cantidad), precio: prod.precio })
    return acc
  }, {})

  const formatHora = (timestamp) => {
    if (!timestamp?.seconds) return ''
    return new Date(timestamp.seconds * 1000).toLocaleTimeString('es-BO', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Resumen del día */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-700">Ventas de hoy</h2>
            <p className="text-xs text-gray-400">{ventasHoy.length} movimiento{ventasHoy.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setModalVenta(true)}
            className="flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
          >
            <ShoppingCart size={16} />
            Nueva venta
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-2">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Package size={14} className="text-gray-400" />
              <p className="text-xs text-gray-500">Ventas hoy</p>
            </div>
            <p className="text-2xl font-semibold text-gray-800">{ventasHoy.length}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-emerald-600" />
              <p className="text-xs text-emerald-600">Total hoy</p>
            </div>
            <p className="text-2xl font-semibold text-emerald-700">Bs. {totalHoy.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Lista de ventas del día */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Detalle de ventas</h2>

        {ventasHoy.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingCart className="text-gray-300 mb-2" size={36} />
            <p className="text-gray-400 text-sm">No hay ventas registradas hoy</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {Object.values(ventasAgrupadas).map((grupo, i) => {
              const subtotal = grupo.items.reduce((a, it) => a + it.precio * it.cantidad, 0)
              return (
                <div key={i} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">{formatHora(grupo.fecha)}</span>
                    <span className="text-xs font-semibold text-emerald-700">Bs. {subtotal.toFixed(2)}</span>
                  </div>
                  {grupo.items.map((item, j) => (
                    <div key={j} className="flex justify-between text-sm text-gray-700 py-0.5">
                      <span>{item.cantidad}× {item.nombre}</span>
                      <span className="text-gray-500">Bs. {(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Venta */}
      {modalVenta && (
        <ModalVenta
          productos={productos}
          categorias={categoriasProducto}
          onConfirmar={async (items) => {
            await onConfirmarVenta(items)
            setModalVenta(false)
          }}
          onCerrar={() => setModalVenta(false)}
        />
      )}
    </div>
  )
}