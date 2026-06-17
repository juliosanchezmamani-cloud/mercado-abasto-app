import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './hooks/useAuth'
import LoginScreen from './screens/LoginScreen'
import AdminDashboard from './screens/AdminDashboard'
import ComercianteDashboard from './screens/ComercianteDashboard'
import InicioScreen from './screens/InicioScreen'
import NotFoundScreen from './screens/NotFoundScreen'

function RutaProtegida({ children, rolRequerido }) {
  const { usuario, rol } = useAuthStore()
  if (!usuario) return <Navigate to="/login" />
  if (rolRequerido && rol !== rolRequerido) return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route
          path="/admin"
          element={
            <RutaProtegida rolRequerido="admin">
              <AdminDashboard />
            </RutaProtegida>
          }
        />
        <Route
          path="/comerciante"
          element={
            <RutaProtegida rolRequerido="comerciante">
              <ComercianteDashboard />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
