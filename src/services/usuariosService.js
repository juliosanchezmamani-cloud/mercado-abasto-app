import { db, auth } from '../config/firebase'
import {
  collection, getDocs, doc,
  updateDoc, deleteDoc, setDoc,
  serverTimestamp, query, where
} from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export const getComerciantes = async () => {
  const q = query(collection(db, 'users'), where('rol', '==', 'comerciante'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const crearComerciante = async ({ nombre, email, password, sectorId, pasilloId }) => {
  const credencial = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'users', credencial.user.uid), {
    nombre,
    email,
    rol: 'comerciante',
    sectorId,
    pasilloId,
    estado: 'cerrado',
    mensajePausa: '',
    creadoEn: serverTimestamp()
  })
  return credencial.user.uid
}

export const toggleActivarComerciante = async (uid, activo) => {
  await updateDoc(doc(db, 'users', uid), { activo })
}

export const deleteComerciante = async (uid) => {
  await deleteDoc(doc(db, 'users', uid))
}

export const updateComerciante = async (uid, datos) => {
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, datos)
}