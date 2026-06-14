import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuth'

import { escucharPuestos, buscarProductos, getSectoresMap } from '../services/clienteService'

const CATEGORIAS = ['Todas', 'Aseo personal', 'Limpieza hogar', 'Alimentos', 'Bebidas', 'Otro']

const SEMAFORO = {
  abierto: { color: 'bg-green-500', texto: 'Abierto', textoColor: 'text-green-600' },
  pausa: { color: 'bg-yellow-400', texto: 'En pausa', textoColor: 'text-yellow-600' },
  cerrado: { color: 'bg-red-500', texto: 'Cerrado', textoColor: 'text-red-600' },
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

  if (vistaLista) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Mi lista de compras</h1>
          <button
            onClick={() => setVistaLista(false)}
            className="text-green-600 text-sm font-medium"
          >
            ← Volver
          </button>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          {listado.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-8">
              No agregaste productos a tu lista todavía
            </p>
          ) : (
            Object.entries(listadoPorPuesto).map(([puestoId, puesto]) => (
              <div key={puestoId} className="bg-white rounded-xl shadow p-4 mb-4">
                <h2 className="font-semibold text-gray-700 mb-3">{puesto.nombre}</h2>
                {puesto.productos.map(p => (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm text-gray-800">{p.nombre}</p>
                      <p className="text-xs text-gray-500">Bs. {p.precio}</p>
                    </div>
                    <button
                      onClick={() => quitarDeLista(p.id, puestoId)}
                      className="text-red-400 hover:text-red-600 text-xs"
                    >
                      Quitar
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

  if (puestoDetalle) {
    const semaforo = SEMAFORO[puestoDetalle.estado] || SEMAFORO.cerrado
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">{puestoDetalle.nombre}</h1>
          <button
            onClick={() => setPuestoDetalle(null)}
            className="text-green-600 text-sm font-medium"
          >
            ← Volver
          </button>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          <div className={`flex items-center gap-2 mb-6 p-3 rounded-lg ${
            puestoDetalle.estado === 'abierto' ? 'bg-green-50' :
            puestoDetalle.estado === 'pausa' ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <div className={`w-3 h-3 rounded-full ${semaforo.color}`} />
            <span className={`text-sm font-medium ${semaforo.textoColor}`}>
              {semaforo.texto}
              {puestoDetalle.estado === 'pausa' && puestoDetalle.mensajePausa &&
                ` — ${puestoDetalle.mensajePausa}`
              }
            </span>
          </div>
          {puestoDetalle.productos?.length === 0 ? (
            <p className="text-gray-400 text-sm">Este puesto no tiene productos cargados</p>
          ) : (
            puestoDetalle.productos?.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow p-4 mb-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{p.nombre}</p>
                  <p className="text-sm text-gray-500">{p.categoria} · Bs. {p.precio}</p>
                  <p className="text-xs mt-1">{p.enStock ? '✅ En stock' : '❌ Sin stock'}</p>
                </div>
                <button
                  onClick={() => agregarALista({ ...p, puestoId: puestoDetalle.id, puestoNombre: puestoDetalle.nombre, puestoEstado: puestoDetalle.estado })}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700"
                >
                  + Lista
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Mercado Abasto</h1>
        <div className="flex items-center gap-3">
          {usuario && (
            <button
              onClick={() => navigate('/login')}
              className="text-gray-500 text-sm"
            >
              Ingresar
            </button>
          )}
          <button
            onClick={() => setVistaLista(true)}
            className="relative bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            Mi lista
            {listado.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {listado.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">

        {/* Búsqueda */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleBuscar}
              disabled={buscando}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {buscando ? '...' : 'Buscar'}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIAS.map(c => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  categoria === c
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 text-gray-600 hover:border-green-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Resultados de búsqueda */}
        {resultados.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-3">
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
            </h2>
            {resultados.map((p) => {
              const semaforo = SEMAFORO[p.puestoEstado] || SEMAFORO.cerrado
              return (
                <div key={`${p.puestoId}-${p.id}`} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.nombre}</p>
                    <p className="text-xs text-gray-500">Bs. {p.precio} · {p.puestoNombre}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${semaforo.color}`} />
                      <span className={`text-xs ${semaforo.textoColor}`}>
                        {semaforo.texto}
                        {p.puestoEstado === 'pausa' && p.puestoMensaje && ` — ${p.puestoMensaje}`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => agregarALista(p)}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700"
                  >
                    + Lista
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Puestos del mercado */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">
            Puestos del mercado
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {puestos.map((puesto) => {
              const semaforo = SEMAFORO[puesto.estado] || SEMAFORO.cerrado
              return (
                <div
                  key={puesto.id}
                  onClick={async () => {
                    const { getProductosDePuesto } = await import('../services/clienteService')
                    const productos = await getProductosDePuesto(puesto.id)
                    setPuestoDetalle({ ...puesto, productos })
                  }}
                  className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{puesto.nombre || 'Sin nombre'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {puesto.sectorId && mapaUbicaciones[puesto.sectorId]
                          ? `Sector ${mapaUbicaciones[puesto.sectorId]}`
                          : ''}
                        {puesto.pasilloId && mapaUbicaciones[`pasillo_${puesto.pasilloId}`]
                          ? ` · Pasillo ${mapaUbicaciones[`pasillo_${puesto.pasilloId}`]}`
                          : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${semaforo.color}`} />
                      <span className={`text-xs font-medium ${semaforo.textoColor}`}>
                        {semaforo.texto}
                      </span>
                    </div>
                  </div>
                  {puesto.estado === 'pausa' && puesto.mensajePausa && (
                    <p className="text-xs text-yellow-600 mt-2">{puesto.mensajePausa}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}