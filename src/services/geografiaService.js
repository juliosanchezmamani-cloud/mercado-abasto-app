import { db } from '../config/firebase'
import {
  collection, addDoc, getDocs,
  deleteDoc, doc, serverTimestamp, updateDoc
} from 'firebase/firestore'

export const getSectores = async () => {
  const snap = await getDocs(collection(db, 'sectores'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addSector = async (nombre) => {
  await addDoc(collection(db, 'sectores'), {
    nombre,
    creadoEn: serverTimestamp()
  })
}

export const deleteSector = async (id) => {
  await deleteDoc(doc(db, 'sectores', id))
}

export const getPasillos = async (sectorId) => {
  const snap = await getDocs(
    collection(db, 'sectores', sectorId, 'pasillos')
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addPasillo = async (sectorId, numero) => {
  await addDoc(collection(db, 'sectores', sectorId, 'pasillos'), {
    numero,
    creadoEn: serverTimestamp()
  })
}

export const deletePasillo = async (sectorId, pasilloId) => {
  await deleteDoc(doc(db, 'sectores', sectorId, 'pasillos', pasilloId))
}

export const updateSector = async (id, nombre) => {
  const ref = doc(db, 'sectores', id)
  await updateDoc(ref, { nombre })
}