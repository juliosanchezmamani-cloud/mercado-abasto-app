import { CheckCircle2, PauseCircle, XCircle, Clock, Package, AlertTriangle, ShoppingCart, TrendingUp } from 'lucide-react'

const ESTADOS = [
  { valor: 'abierto', label: 'Abierto', color: 'bg-green-500', hover: 'hover:bg-green-600', icon: CheckCircle2 },
  { valor: 'pausa',   label: 'Pausa',   color: 'bg-yellow-400', hover: 'hover:bg-yellow-500', icon: PauseCircle },
  { valor: 'cerrado', label: 'Cerrado', color: 'bg-red-500',   hover: 'hover:bg-red-600',   icon: XCircle },
]

export default function TabInicio({
  datosComercante, estadoActual, onCambiarEstado,
  productos, ventasHoy
}) {
  const stockBajo    = productos.filter(p => p.stock > 0 && p.stock <= p.stockMinimo)
  const sinStock     = productos.filter(p => p.stock <= 0)
  const totalHoy     = ventasHoy.reduce((acc, v) => {
    const prod = productos.find(p => p.id === v.productoId)
    if (!prod) return acc
    return acc + (prod.precio * Math.abs(v.cantidad))
  }, 0)

  return (
    <div className="flex flex-col gap-4">

      {/* Semáforo */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-base font-semibold text-gray-700 mb-1">Estado de mi tienda</h2>
        <p className="text-xs text-gray-400 mb-4">Tus clientes ven este estado en tiempo real</p>

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
                onClick={() => onCambiarEstado(e.valor)}
                className={`flex flex-col items-center gap-1.5 py-4 rounded-xl text-white font-semibold text-sm
                  ${e.color} ${e.hover} transition-all
                  ${activo ? 'ring-2 ring-offset-2 ring-gray-300 scale-[1.03]' : 'opacity-75'}`}
              >
                <Icon size={22} />
                {e.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Resumen del día */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Resumen de hoy</h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Package size={14} className="text-gray-400" />
              <p className="text-xs text-gray-500">Productos</p>
            </div>
            <p className="text-2xl font-semibold text-gray-800">{productos.length}</p>
          </div>

          <div className={`rounded-xl p-4 ${sinStock.length > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={14} className={sinStock.length > 0 ? 'text-red-400' : 'text-gray-400'} />
              <p className={`text-xs ${sinStock.length > 0 ? 'text-red-500' : 'text-gray-500'}`}>Sin stock</p>
            </div>
            <p className={`text-2xl font-semibold ${sinStock.length > 0 ? 'text-red-600' : 'text-gray-800'}`}>
              {sinStock.length}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart size={14} className="text-gray-400" />
              <p className="text-xs text-gray-500">Ventas hoy</p>
            </div>
            <p className="text-2xl font-semibold text-gray-800">{ventasHoy.length}</p>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-emerald-600" />
              <p className="text-xs text-emerald-600">Total hoy</p>
            </div>
            <p className="text-2xl font-semibold text-emerald-700">
              Bs. {totalHoy.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Alertas de stock */}
      {(stockBajo.length > 0 || sinStock.length > 0) && (
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            ⚠️ Alertas de stock
          </h2>
          <div className="flex flex-col gap-2">
            {sinStock.map(p => (
              <div key={p.id} className="flex justify-between items-center px-3 py-2.5 bg-red-50 rounded-xl">
                <span className="text-sm text-red-700 font-medium">{p.nombre}</span>
                <span className="text-xs text-red-500 font-semibold">Sin stock</span>
              </div>
            ))}
            {stockBajo.map(p => (
              <div key={p.id} className="flex justify-between items-center px-3 py-2.5 bg-yellow-50 rounded-xl">
                <span className="text-sm text-yellow-700 font-medium">{p.nombre}</span>
                <span className="text-xs text-yellow-600 font-semibold">{p.stock} unidades</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}