import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Hoy from './pages/Hoy';
import CrearEvento from './pages/CrearEvento';
import DetalleEvento from './pages/DetalleEvento';
import Progreso from './pages/Progreso';
import Loguin from './pages/loguin';
import Registro from './pages/registro';
import HoyEventos from './pages/HoyEventos';

function RutaProtegida({ children }) {
  let sesionActiva = false;
  try {
    const sesion = JSON.parse(localStorage.getItem('eventpro-session'));
    sesionActiva = Boolean(sesion?.id || sesion?.email);
  } catch {
    sesionActiva = false;
  }
  return sesionActiva ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La página inicial muestra el formulario de acceso */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Loguin />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas requeridas por el documento */}
        <Route path="/hoy" element={<RutaProtegida><Hoy /></RutaProtegida>} />
        <Route path="/crear" element={<RutaProtegida><CrearEvento /></RutaProtegida>} />
        <Route path="/evento/:id" element={<RutaProtegida><DetalleEvento /></RutaProtegida>} />
        <Route path="/progreso" element={<RutaProtegida><Progreso /></RutaProtegida>} />
        <Route path="/hoy-eventos" element={<RutaProtegida><HoyEventos /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;