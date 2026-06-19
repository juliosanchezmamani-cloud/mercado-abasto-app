import { db } from '../config/firebase'
import {
  doc, updateDoc, onSnapshot,
  collection, addDoc, getDocs,
  deleteDoc, serverTimestamp, query, where
} from 'firebase/firestore'

// ─── Semáforo ───────────────────────────────────────────────
export const escucharEstadoComercante = (uid, callback) => {
  const ref = doc(db, 'users', uid)
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data())
  })
}

export const actualizarEstado = async (uid, estado, mensajePausa = '') => {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, {
    estado,
    mensajePausa: estado === 'pausa' ? mensajePausa : '',
    actualizadoEn: serverTimestamp()
  })
  await addDoc(collection(db, 'auditLogs'), {
    uid,
    tipo: 'cambio_estado',
    valorAnterior: null,
    valorNuevo: estado,
    timestamp: serverTimestamp()
  })
}

// ─── Catálogos (marcas y categorías desde Firestore) ────────
export const getMarcas = async () => {
  const q = query(collection(db, 'marcas'), where('activo', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getCategoriasProducto = async () => {
  const q = query(collection(db, 'categoriasProducto'), where('activo', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getCategoriasTienda = async () => {
  const q = query(collection(db, 'categoriasTienda'), where('activo', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── Productos ───────────────────────────────────────────────
export const getProductos = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'productos'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addProducto = async (uid, producto) => {
  await addDoc(collection(db, 'users', uid, 'productos'), {
    nombre:       producto.nombre,
    precio:       producto.precio,
    categoriaId:  producto.categoriaId,
    categoriaNombre: producto.categoriaNombre,
    marcaId:      producto.marcaId,
    marcaNombre:  producto.marcaNombre,
    stock:        producto.stock,
    stockMinimo:  producto.stockMinimo,
    creadoEn:     serverTimestamp()
  })
  await addDoc(collection(db, 'auditLogs'), {
    uid,
    tipo: 'nuevo_producto',
    valorNuevo: producto.nombre,
    timestamp: serverTimestamp()
  })
}

export const updateProducto = async (uid, productoId, datos) => {
  const ref = doc(db, 'users', uid, 'productos', productoId)
  await updateDoc(ref, {
    nombre:          datos.nombre,
    precio:          datos.precio,
    categoriaId:     datos.categoriaId,
    categoriaNombre: datos.categoriaNombre,
    marcaId:         datos.marcaId,
    marcaNombre:     datos.marcaNombre,
    stock:           datos.stock,
    stockMinimo:     datos.stockMinimo,
    actualizadoEn:   serverTimestamp()
  })
  await addDoc(collection(db, 'auditLogs'), {
    uid,
    tipo: 'edicion_producto',
    valorNuevo: datos.nombre || productoId,
    timestamp: serverTimestamp()
  })
}

export const deleteProducto = async (uid, productoId) => {
  await deleteDoc(doc(db, 'users', uid, 'productos', productoId))

}

export const crearCategoria = async (nombre) => {
  const docRef = await addDoc(collection(db, 'categoriasProducto'), {
    nombre: nombre.trim(),
    activo: true
  })
  return { id: docRef.id, nombre: nombre.trim() }
}

export const crearMarca = async (nombre) => {
  const docRef = await addDoc(collection(db, 'marcas'), {
    nombre: nombre.trim(),
    activo: true
  })
  return { id: docRef.id, nombre: nombre.trim() }
}

export const registrarVentaMultiple = async (uid, items) => {
  // items = [{ producto, cantidad }, ...]
  const promesas = items.map(({ producto, cantidad }) => {
    const stockNuevo = producto.stock - cantidad
    const ref = doc(db, 'users', uid, 'productos', producto.id)

    return Promise.all([
      // Actualizar stock
      updateDoc(ref, {
        stock: stockNuevo,
        actualizadoEn: serverTimestamp()
      }),
      // Guardar movimiento por producto
      addDoc(collection(db, 'users', uid, 'productos', producto.id, 'movimientos'), {
        tipo:         'venta',
        cantidad:     -cantidad,
        stockAntes:   producto.stock,
        stockDespues: stockNuevo,
        nota:         'Venta registrada',
        fecha:        serverTimestamp()
      })
    ])
  })

  await Promise.all(promesas)

  // Un solo log de auditoría para toda la venta
  const resumen = items.map(i => `${i.cantidad}x ${i.producto.nombre}`).join(', ')
  await addDoc(collection(db, 'auditLogs'), {
    uid,
    tipo:       'venta_multiple',
    valorNuevo: resumen,
    timestamp:  serverTimestamp()
  })
}

export const ajustarStock = async (uid, productoId, stockNuevo, stockActual, nota = 'Ajuste manual') => {
  const ref = doc(db, 'users', uid, 'productos', productoId)
  await updateDoc(ref, {
    stock: stockNuevo,
    actualizadoEn: serverTimestamp()
  })

  await addDoc(collection(db, 'users', uid, 'productos', productoId, 'movimientos'), {
    tipo:         'ajuste',
    cantidad:     stockNuevo - stockActual,
    stockAntes:   stockActual,
    stockDespues: stockNuevo,
    nota,
    fecha:        serverTimestamp()
  })
}

export const getMovimientos = async (uid) => {
  const productosSnap = await getDocs(collection(db, 'users', uid, 'productos'))
  const todos = []

  await Promise.all(productosSnap.docs.map(async (productoDoc) => {
    const movSnap = await getDocs(
      collection(db, 'users', uid, 'productos', productoDoc.id, 'movimientos')
    )
    movSnap.docs.forEach(m => {
      todos.push({
        id:           m.id,
        productoId:   productoDoc.id,
        productoNombre: productoDoc.data().nombre,
        ...m.data()
      })
    })
  }))

  return todos.sort((a, b) => {
    const fa = a.fecha?.seconds || 0
    const fb = b.fecha?.seconds || 0
    return fb - fa
  })
}

export const getVentasHoy = async (uid) => {
  const movimientos = await getMovimientos(uid)
  const hoy = new Date()
  return movimientos.filter(m => {
    if (m.tipo !== 'venta') return false
    if (!m.fecha?.seconds) return false
    const fecha = new Date(m.fecha.seconds * 1000)
    return (
      fecha.getDate()     === hoy.getDate()     &&
      fecha.getMonth()    === hoy.getMonth()     &&
      fecha.getFullYear() === hoy.getFullYear()
    )
  })
}