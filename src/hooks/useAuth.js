import { create } from 'zustand'
import { auth, db } from '../config/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export const useAuthStore = create((set) => ({
  usuario: null,
  rol: null,
  cargando: true,

  iniciarSesion: async (email, password) => {
    const credencial = await signInWithEmailAndPassword(auth, email, password)
    const docRef = doc(db, 'users', credencial.user.uid)
    const docSnap = await getDoc(docRef)
    set({ usuario: credencial.user, rol: docSnap.data()?.rol || null })
    return docSnap.data()?.rol || null
  },

  cerrarSesion: async () => {
    await signOut(auth)
    set({ usuario: null, rol: null })
  },

  escucharAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        set({ usuario: user, rol: docSnap.data()?.rol || null, cargando: false })
      } else {
        set({ usuario: null, rol: null, cargando: false })
      }
    })
  }
}))