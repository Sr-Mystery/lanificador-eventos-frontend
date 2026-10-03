import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { crearEvento } from '../data/eventos';
import './Hoy.css';

const tiposEvento = {
	cumpleanos: 'Cumpleaños',
	fiesta: 'Fiesta',
	compromiso: 'Compromiso',
	boda: 'Boda',
	'baby-shower': 'Baby shower',
	graduacion: 'Graduación',
	corporativo: 'Evento corporativo',
	otro: 'Otra ocasión',
};

export default function CrearEvento() {
	const [searchParams] = useSearchParams();
	const tipo = tiposEvento[searchParams.get('tipo')] || 'Evento';
	const [nombre, setNombre] = useState(tipo === 'Otra ocasión' ? '' : tipo);
	const [horas, setHoras] = useState('6');
	const [fecha, setFecha] = useState('');
	const [lugar, setLugar] = useState('');
	const [error, setError] = useState('');
	const [guardando, setGuardando] = useState(false);
	const [eventoCreado, setEventoCreado] = useState('');
	const fechaMinima = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

	function handleSubmit(event) {
		event.preventDefault();
		setError('');
		setGuardando(true);

		try {
			crearEvento({ nombre: nombre.trim(), fecha, lugar: lugar.trim(), limite_horas_diarias: Number(horas) });
			setEventoCreado(nombre.trim());
		} catch {
			setError('No se pudo guardar el evento en este dispositivo.');
		} finally {
			setGuardando(false);
		}
	}

	return (
		<main className="create-event-page">
			<header className="event-topbar">
				<Link className="event-brand" to="/hoy" aria-label="EventPro, inicio">
					<span className="event-brand-mark" aria-hidden="true">E</span>
					<span>EventPro</span>
				</Link>
				<nav className="event-nav" aria-label="Navegación principal">
					<Link to="/hoy">Crear evento</Link>
					<Link to="/progreso">Mis eventos</Link>
				</nav>
				<span className="event-user-mark" aria-label="Tu perfil">EP</span>
			</header>

			<section className="create-event-main">
				<Link className="create-back" to="/hoy">← Volver a las ocasiones</Link>
				{eventoCreado ? (
					<div className="create-success-panel" role="status" aria-live="polite">
						<span className="create-success-icon" aria-hidden="true">✓</span>
						<p className="section-kicker">EVENTO CREADO</p>
						<h1>{eventoCreado}</h1>
						<p>Ya está en tu lista. Puedes seguir añadiendo los detalles de la celebración.</p>
						<Link className="continue-button" to="/progreso">Ver mis eventos <span aria-hidden="true">→</span></Link>
					</div>
				) : (
					<div className="create-form-panel">
						<p className="section-kicker">NUEVO EVENTO · {tipo.toUpperCase()}</p>
						<h1>Pongámosle nombre.</h1>
						<p>Empieza con lo esencial. Podrás organizar el resto después.</p>
						<form className="create-form" onSubmit={handleSubmit}>
							<label htmlFor="event-name">
								Nombre del evento
								<input
									autoFocus
									autoComplete="off"
									id="event-name"
									maxLength={200}
									name="nombre"
									onChange={(event) => setNombre(event.target.value)}
									placeholder={`Ej. ${tipo} de Laura`}
									required
									value={nombre}
								/>
							</label>
							<label htmlFor="event-date">
								Fecha del evento
								<input
									id="event-date"
									min={fechaMinima}
									name="fecha"
									onChange={(event) => setFecha(event.target.value)}
									required
									type="date"
									value={fecha}
								/>
							</label>
							<label htmlFor="event-place">
								Lugar
								<input
									id="event-place"
									maxLength={200}
									name="lugar"
									onChange={(event) => setLugar(event.target.value)}
									placeholder="Ej. Jardín Las Flores"
									required
									value={lugar}
								/>
							</label>
							<label htmlFor="event-hours">
								Horas disponibles al día
								<input
									id="event-hours"
									max="24"
									min="1"
									name="horas"
									onChange={(event) => setHoras(event.target.value)}
									type="number"
									value={horas}
								/>
							</label>
							{error && <p className="create-error" role="alert">{error}</p>}
							<button className="continue-button" type="submit" disabled={guardando || !nombre.trim()}>
								{guardando ? 'Guardando…' : 'Crear evento'} <span aria-hidden="true">→</span>
							</button>
						</form>
					</div>
				)}
			</section>
		</main>
	);
}