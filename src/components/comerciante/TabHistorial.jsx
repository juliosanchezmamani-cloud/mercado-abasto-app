import { Clock, TrendingDown, TrendingUp, Settings } from 'lucide-react'

const TIPO_CONFIG = {
  venta:  { label: 'Venta',         color: 'bg-blue-50 text-blue-600',    dot: 'bg-blue-500',    icon: TrendingDown },
  ajuste: { label: 'Ajuste manual', color: 'bg-gray-50 text-gray-600',    dot: 'bg-gray-400',    icon: Settings },
  entrada:{ label: 'Entrada',       color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', icon: TrendingUp },
}

export default function TabHistorial({ movimientos }) {
  const formatFecha = (timestamp) => {
    if (!timestamp?.seconds) return '—'
    return new Date(timestamp.seconds * 1000).toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Historial de movimientos</h2>

      {movimientos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Clock className="text-gray-300 mb-2" size={36} />
          <p className="text-gray-400 text-sm">No hay movimientos registrados</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {movimientos.map((m) => {
            const config = TIPO_CONFIG[m.tipo] || TIPO_CONFIG.ajuste
            const Icon   = config.icon
            const esNegativo = m.cantidad < 0

            return (
              <div key={m.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                <div className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {m.productoNombre}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400">{formatFecha(m.fecha)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${esNegativo ? 'text-red-500' : 'text-emerald-600'}`}>
                    {esNegativo ? '' : '+'}{m.cantidad}
                  </p>
                  <p className="text-xs text-gray-400">
                    {m.stockAntes} → {m.stockDespues}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
