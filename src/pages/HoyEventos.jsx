import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MenuUsuario from '../components/MenuUsuario';
import './Hoy.css';

const API = '';

export default function HoyEventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/eventos/`, { credentials: 'include' });
      if (!res.ok) throw new Error('No se pudo cargar los eventos.');
      const data = await res.json();
      setEventos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const fechaRecienteMax = Date.now() - (1000 * 60 * 60 * 24 * 7);

  const eventosOrdenados = [...eventos]
    .map(ev => ({
      ...ev,
      tareasHoy: (ev.tareas || []).filter(t => t.fecha_asignada === hoyStr),
      tareasPendientes: (ev.tareas || []).filter(t => t.estado !== 'HECHO'),
      esReciente: Boolean(ev.updatedAt || ev.createdAt) && new Date(ev.updatedAt || ev.createdAt).getTime() > fechaRecienteMax,
    }))
    .sort((a, b) => {
      const fechaA = new Date(a.updatedAt || a.createdAt || a.fecha_evento || 0).getTime();
      const fechaB = new Date(b.updatedAt || b.createdAt || b.fecha_evento || 0).getTime();
      return fechaB - fechaA;
    });

  const eventosHoy = eventosOrdenados.filter(ev => ev.fecha_evento === hoyStr || ev.tareasHoy.length > 0);
  const eventosRecientes = eventosOrdenados.filter(ev => ev.esReciente);

  return (
    <main className="prog-page">
      <header className="event-topbar">
        <Link className="event-brand" to="/hoy" aria-label="EventPro, inicio">
          <span className="event-brand-mark" aria-hidden="true">E</span>
          <span>EventPro</span>
        </Link>
        <nav className="event-nav" aria-label="Navegación principal">
          <Link to="/hoy">Crear evento</Link>
          <span className="event-nav-current" aria-current="page">Hoy</span>
          <Link to="/progreso">Mis eventos</Link>
        </nav>
        <MenuUsuario />
      </header>

      <div className="prog-container">
        <div className="prog-head">
          <div>
            <p className="prog-kicker">EVENTOS DE HOY</p>
            <h1 className="prog-titulo">Eventos del día</h1>
            <p className="prog-subtitulo">Eventos y tareas programados para hoy.</p>
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
            <button className="prog-action prog-action-primary" onClick={cargar} title="Intentar cargar los eventos de hoy otra vez">Reintentar</button>
          </div>
        )}

        {!cargando && !error && eventosHoy.length === 0 && eventosRecientes.length === 0 && (
          <div className="prog-estado">
            <span className="prog-vacio-icon">✦</span>
            <p>No tienes eventos ni tareas programados para hoy.</p>
          </div>
        )}

        {!cargando && !error && eventosRecientes.length > 0 && (
          <div className="prog-eventos-lista" style={{ marginBottom: '2rem' }}>
            <p className="prog-kicker">NOVEDADES</p>
            {eventosRecientes.map(ev => (
              <article key={ev.id} className="prog-evento-card">
                <div className="prog-evento-header">
                  <div className="prog-evento-info">
                    <Link to={`/evento/${ev.id}`} className="prog-evento-nombre">{ev.nombre}</Link>
                    <p className="prog-evento-meta">
                      {ev.fecha_evento ? `${ev.fecha_evento}${ev.hora_evento ? ` · ${ev.hora_evento.slice(0, 5)}` : ''}` : 'Sin fecha definida'}
                    </p>
                  </div>
                </div>
                <p className="prog-sin-tareas-msg">
                  {ev.updatedAt && (!ev.createdAt || new Date(ev.updatedAt).getTime() > new Date(ev.createdAt).getTime())
                    ? 'Evento editado recientemente.'
                    : 'Evento creado recientemente.'}
                </p>
              </article>
            ))}
          </div>
        )}

        {!cargando && !error && eventosHoy.length > 0 && (
          <div className="prog-eventos-lista">
            <p className="prog-kicker">PARA HOY</p>
            {eventosHoy.map(ev => (
              <article key={ev.id} className="prog-evento-card">
                <div className="prog-evento-header">
                  <div className="prog-evento-info">
                    <Link to={`/evento/${ev.id}`} className="prog-evento-nombre">{ev.nombre}</Link>
                    <p className="prog-evento-meta">
                      {ev.fecha_evento === hoyStr && `Evento · ${ev.hora_evento ? ev.hora_evento.slice(0, 5) : 'hora pendiente'} · `}
                      {ev.tareasHoy.length} tarea{ev.tareasHoy.length !== 1 ? 's' : ''} hoy
                    </p>
                  </div>
                </div>
                {ev.tareasHoy.length > 0 ? (
                  <div className="prog-tareas-lista">
                    {ev.tareasHoy.map(tarea => (
                      <div className="prog-tarea" key={tarea.id}>
                        <div className="prog-tarea-info">
                          <span className="prog-tarea-titulo">{tarea.titulo}</span>
                          <span className="prog-tarea-meta">
                            {tarea.hora_asignada ? tarea.hora_asignada.slice(0, 5) : 'Hora pendiente'} · {tarea.horas_estimadas}h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="prog-sin-tareas-msg">Evento programado para hoy, sin subtareas asignadas.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
