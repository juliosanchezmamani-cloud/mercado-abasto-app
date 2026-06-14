import { db } from '../config/firebase'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'

export const getLogs = async () => {
  const q = query(
    collection(db, 'auditLogs'),
    orderBy('timestamp', 'desc'),
    limit(50)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
