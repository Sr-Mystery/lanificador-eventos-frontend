import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from './data/localStore';

// Protege las rutas internas: si no hay sesión activa redirige al login.
export default function ProtectedRoute() {
  return getCurrentUser() ? <Outlet /> : <Navigate to="/login" replace />;
}
