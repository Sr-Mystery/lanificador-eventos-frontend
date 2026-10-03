import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerEventos } from '../data/eventos';
import './Hoy.css';

export default function HoyEventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  function cargar() {
    setError('');
    try {
      setEventos(obtenerEventos());
    } catch {
      setError('No se pudieron cargar los eventos guardados.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // Filter events that have at least one task for today
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  
  const eventosHoy = eventos.filter(ev =>
    (ev.tareas || []).some(t => t.fecha_asignada === hoyStr)
  );

  return (
    <main className="prog-page">
      <header className="event-topbar">
        <Link className="event-brand" to="/hoy" aria-label="EventPro, inicio">
          <span className="event-brand-mark" aria-hidden="true">E</span>
          <span>EventPro</span>
        </Link>
        <nav className="event-nav" aria-label="Navegación principal">
          <Link to="/hoy">Crear evento</Link>
          <Link to="/progreso">Mis eventos</Link>
          <Link to="/hoy-eventos">HOY</Link>
        </nav>
        <span className="event-user-mark" aria-label="Tu perfil">EP</span>
      </header>

      <div className="prog-container">
        <div className="prog-head">
          <div>
            <p className="prog-kicker">EVENTOS DE HOY</p>
            <h1 className="prog-titulo">Eventos del día</h1>
            <p className="prog-subtitulo">Los eventos que tienen tareas programadas para hoy.</p>
          </div>
        </div>

        {cargando && (
          <div className="prog-estado">
            <span className="prog-spinner" />
            <p>Cargando eventos…</p>
          </div>
        )}

        {error && (
          <div className="prog-estado prog-estado-error">
            <p>{error}</p>
            <button className="prog-action prog-action-primary" onClick={cargar}>Reintentar</button>
          </div>
        )}

        {!cargando && !error && eventosHoy.length === 0 && (
          <div className="prog-estado">
            <span className="prog-vacio-icon">✦</span>
            <p>No hay eventos con tareas para hoy.</p>
          </div>
        )}

        {!cargando && !error && eventosHoy.length > 0 && (
          <div className="prog-eventos-lista">
            {eventosHoy.map(ev => (
              <article key={ev.id} className="prog-evento-card">
                <div className="prog-evento-header">
                  <div className="prog-evento-info">
                    <Link to={`/evento/${ev.id}`} className="prog-evento-nombre">{ev.nombre}</Link>
                    <p className="prog-evento-meta">
                      {(ev.tareas || []).length} tarea{(ev.tareas || []).length !== 1 ? 's' : ''}
                      {ev.fecha && ` · ${ev.fecha}`}
                      {ev.lugar && ` · ${ev.lugar}`}
                    </p>
                  </div>
                  {ev.realizado && <span className="prog-badge badge-hecho">REALIZADO</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
