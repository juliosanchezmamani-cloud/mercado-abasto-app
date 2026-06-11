import { db } from '../config/firebase'
import {
  doc, updateDoc, onSnapshot,
  collection, addDoc, getDocs,
  deleteDoc, serverTimestamp
} from 'firebase/firestore'

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

export const getProductos = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'productos'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addProducto = async (uid, producto) => {
  await addDoc(collection(db, 'users', uid, 'productos'), {
    ...producto,
    creadoEn: serverTimestamp()
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
  await updateDoc(ref, { ...datos, actualizadoEn: serverTimestamp() })
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