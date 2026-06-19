import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Plus } from 'lucide-react'

export default function ComboBox({ label, opciones, valor, nombreValor, onChange, onCrear }) {
  const [query, setQuery]       = useState('')
  const [abierto, setAbierto]   = useState(false)
  const ref                     = useRef(null)

  // Cuando cambia el valor externo, sincronizar el texto del input
  useEffect(() => {
    setQuery(nombreValor || '')
  }, [nombreValor])

  // Cerrar si se hace clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false)
        // Si el usuario escribió algo pero no eligió, restaurar el valor anterior
        setQuery(nombreValor || '')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [nombreValor])

  const filtradas = opciones.filter(op =>
    op.nombre.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (opcion) => {
    onChange(opcion)
    setQuery(opcion.nombre)
    setAbierto(false)
  }

  const handleCrear = () => {
    onCrear(query.trim())
    setAbierto(false)
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    setAbierto(true)
    // Si borra todo, limpiar selección
    if (!e.target.value) onChange(null)
  }

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-xs text-gray-500 mb-1 block pl-1">{label}</label>
      )}

      {/* Input */}
      <div
        className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-2 cursor-text focus-within:ring-2 focus-within:ring-emerald-700"
        onClick={() => setAbierto(true)}
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setAbierto(true)}
          placeholder={`Buscar ${label?.toLowerCase() || ''}...`}
          className="flex-1 text-sm outline-none bg-transparent"
        />
        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform ${abierto ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

          {/* Lista filtrada */}
          <ul className="max-h-44 overflow-y-auto">
            {filtradas.length === 0 && (
              <li className="px-4 py-2.5 text-sm text-gray-400">
                No se encontró "{query}"
              </li>
            )}
            {filtradas.map((op) => (
              <li
                key={op.id}
                onMouseDown={() => handleSelect(op)}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-emerald-50 hover:text-emerald-800 transition-colors
                  ${op.id === valor ? 'bg-emerald-50 text-emerald-800 font-medium' : 'text-gray-700'}`}
              >
                {op.nombre}
              </li>
            ))}
          </ul>

          {/* Opción crear nueva */}
          {query.trim() && !filtradas.find(op => op.nombre.toLowerCase() === query.toLowerCase()) && (
            <div className="border-t border-gray-100">
              <button
                onMouseDown={handleCrear}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-700 font-medium hover:bg-emerald-50 transition-colors"
              >
                <Plus size={14} />
                Crear "{query.trim()}"
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  )
}