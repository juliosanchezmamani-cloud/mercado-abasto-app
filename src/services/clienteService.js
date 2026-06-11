import { db } from '../config/firebase'
import {
  collection, getDocs, onSnapshot,
  query, where
} from 'firebase/firestore'

export const escucharPuestos = (callback) => {
  const ref = collection(db, 'users')
  return onSnapshot(ref, (snap) => {
    const puestos = snap.docs
      .filter(d => d.data().rol === 'comerciante')
      .map(d => ({ id: d.id, ...d.data() }))
    callback(puestos)
  })
}

export const getProductosDePuesto = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'productos'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const buscarProductos = async (termino, categoria) => {
  const puestosSnap = await getDocs(
    query(collection(db, 'users'), where('rol', '==', 'comerciante'))
  )
  const resultados = []
  for (const puesto of puestosSnap.docs) {
    const productosSnap = await getDocs(
      collection(db, 'users', puesto.id, 'productos')
    )
    productosSnap.docs.forEach(d => {
      const p = d.data()
      const coincideNombre = termino
        ? p.nombre.toLowerCase().includes(termino.toLowerCase())
        : true
      const coincideCategoria = categoria && categoria !== 'Todas'
        ? p.categoria === categoria
        : true
      if (coincideNombre && coincideCategoria) {
        resultados.push({
          id: d.id,
          ...p,
          puestoId: puesto.id,
          puestoNombre: puesto.data().nombre || 'Sin nombre',
          puestoEstado: puesto.data().estado || 'cerrado',
          puestoMensaje: puesto.data().mensajePausa || ''
        })
      }
    })
  }
  return resultados
}