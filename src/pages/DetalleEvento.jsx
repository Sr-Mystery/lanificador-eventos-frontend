import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { actualizarEvento, actualizarTarea, agregarTarea, eliminarTarea, obtenerEventos } from '../data/eventos';
import './Hoy.css';
import './DetalleEvento.css';

const ESTADO_LABEL = {
	PENDIENTE:   { label: 'PENDIENTE',   cls: 'badge-proxima' },
	EN_PROGRESO: { label: 'EN PROGRESO', cls: 'badge-hoy' },
	HECHO:       { label: 'HECHO',       cls: 'badge-hecho' },
	POSPUESTO:   { label: 'POSPUESTO',   cls: 'badge-pospuesto' },
};

function TareaFila({ tarea, onEstado, onEliminar }) {
	const { label, cls } = ESTADO_LABEL[tarea.estado] || ESTADO_LABEL.PENDIENTE;
	return (
		<div className="det-tarea">
			<div className="det-tarea-info">
				<span className="det-tarea-titulo">{tarea.titulo}</span>
				<span className="det-tarea-meta">
					📅 {tarea.fecha_asignada} · ⏱ {tarea.horas_estimadas}h · {tarea.prioridad}
				</span>
			</div>
			<span className={`prog-badge ${cls}`}>{label}</span>
			<div className="det-tarea-actions">
				{tarea.estado !== 'HECHO' && (
					<button className="prog-action prog-action-primary" onClick={() => onEstado(tarea.id, 'HECHO')}>
						✓ Hecho
					</button>
				)}
				{tarea.estado === 'PENDIENTE' && (
					<button className="prog-action" onClick={() => onEstado(tarea.id, 'EN_PROGRESO')}>
						↻ En progreso
					</button>
				)}
				<button className="prog-action det-btn-eliminar" onClick={() => onEliminar(tarea.id)}>
					✕
				</button>
			</div>
		</div>
	);
}

const FORM_INICIAL = { titulo: '', fecha_asignada: '', horas_estimadas: '', prioridad: 'NORMAL' };

export default function DetalleEvento() {
	const { id } = useParams();
	const [evento, setEvento] = useState(null);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState('');
	const [form, setForm] = useState(FORM_INICIAL);
	const [formError, setFormError] = useState('');
	const [guardando, setGuardando] = useState(false);
	const [abrirForm, setAbrirForm] = useState(false);
	const [editarEvento, setEditarEvento] = useState(false);
	const [formEvento, setFormEvento] = useState({ nombre: '', fecha: '', lugar: '', limite_horas_diarias: 6 });

	function cargar() {
		setError('');
		try {
			const encontrado = obtenerEventos().find((item) => String(item.id) === String(id));
			if (!encontrado) throw new Error('No se encontró el evento.');
			setEvento(encontrado);
			setFormEvento({
				nombre: encontrado.nombre || '',
				fecha: encontrado.fecha || '',
				lugar: encontrado.lugar || '',
				limite_horas_diarias: encontrado.limite_horas_diarias || 6,
			});
		} catch (loadError) {
			setError(loadError.message);
		} finally {
			setCargando(false);
		}
	}

	useEffect(() => { cargar(); }, [id]);

	function handleChange(e) {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
		setFormError('');
	}

	function handleEventoChange(e) {
		const { name, value } = e.target;
		setFormEvento((prev) => ({ ...prev, [name]: value }));
	}

	function handleGuardarEvento(e) {
		e.preventDefault();
		if (!formEvento.nombre.trim()) return setFormError('Escribe un nombre para el evento.');
		actualizarEvento(id, {
			...formEvento,
			nombre: formEvento.nombre.trim(),
			lugar: formEvento.lugar.trim(),
			limite_horas_diarias: Number(formEvento.limite_horas_diarias),
		});
		setEditarEvento(false);
		setFormError('');
		cargar();
	}

	function handleRealizado() {
		actualizarEvento(id, { realizado: !evento.realizado });
		cargar();
	}

	function handleAgregarTarea(e) {
		e.preventDefault();
		if (!form.titulo.trim()) return setFormError('Escribe un nombre para la tarea.');
		if (!form.fecha_asignada)  return setFormError('Selecciona una fecha.');
		if (!form.horas_estimadas || Number(form.horas_estimadas) <= 0)
			return setFormError('Ingresa las horas estimadas.');

		setGuardando(true);
		setFormError('');
		try {
			agregarTarea(id, {
				titulo: form.titulo.trim(),
				fecha_asignada: form.fecha_asignada,
				horas_estimadas: Number(form.horas_estimadas),
				prioridad: form.prioridad,
			});
			setForm(FORM_INICIAL);
			setAbrirForm(false);
			cargar();
		} catch {
			setFormError('No se pudo guardar la tarea en este dispositivo.');
		} finally {
			setGuardando(false);
		}
	}

	function handleEstado(tareaId, nuevoEstado) {
		try {
			actualizarTarea(tareaId, { estado: nuevoEstado });
			cargar();
		} catch { setError('No se pudo actualizar la tarea.'); }
	}

	function handleEliminar(tareaId) {
		if (!confirm('¿Eliminar esta tarea?')) return;
		try {
			eliminarTarea(tareaId);
			cargar();
		} catch { setError('No se pudo eliminar la tarea.'); }
	}

	const tareas = evento?.tareas || [];
	const hechas = tareas.filter(t => t.estado === 'HECHO').length;
	const pct = tareas.length > 0 ? Math.round((hechas / tareas.length) * 100) : 0;

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

			<div className="det-container">
				<Link className="create-back" to="/progreso">← Volver a mis eventos</Link>

				{cargando && <p className="det-cargando">Cargando…</p>}
				{error && <p className="det-error" role="alert">{error}</p>}

				{evento && (
					<>
						{/* ── Cabecera del evento ── */}
						<div className="det-header">
							<div>
								<p className="section-kicker">DETALLE DEL EVENTO</p>
								<h1 className="det-titulo">{evento.nombre}</h1>
								<p className="det-meta">
									{tareas.length} tarea{tareas.length !== 1 ? 's' : ''}
									{tareas.length > 0 && ` · ${pct}% completado`}
									{evento.fecha && ` · ${evento.fecha}`}
									{evento.lugar && ` · ${evento.lugar}`}
									{` · Límite ${evento.limite_horas_diarias}h/día`}
								</p>
							</div>
							<div className="det-header-actions">
								<button className="prog-action" onClick={() => setEditarEvento((value) => !value)}>
									{editarEvento ? 'Cancelar edición' : 'Editar evento'}
								</button>
								<button className="prog-action" onClick={handleRealizado}>
									{evento.realizado ? 'Marcar pendiente' : 'Marcar realizado'}
								</button>
								<button
									className="prog-action prog-action-primary det-btn-nueva"
									onClick={() => setAbrirForm((value) => !value)}
								>
									{abrirForm ? '✕ Cancelar tarea' : '+ Nueva tarea'}
								</button>
							</div>
						</div>

						{evento.realizado && <p className="prog-badge badge-hecho">EVENTO REALIZADO</p>}

						{editarEvento && (
							<form className="det-form" onSubmit={handleGuardarEvento}>
								<h2 className="det-form-titulo">Editar evento</h2>
								<div className="det-form-grid">
									<label className="det-label">
										Nombre del evento
										<input className="det-input" name="nombre" value={formEvento.nombre} onChange={handleEventoChange} maxLength={200} required />
									</label>
									<label className="det-label">
										Fecha del evento
										<input className="det-input" type="date" name="fecha" value={formEvento.fecha} onChange={handleEventoChange} required />
									</label>
									<label className="det-label">
										Lugar
										<input className="det-input" name="lugar" value={formEvento.lugar} onChange={handleEventoChange} maxLength={200} required />
									</label>
									<label className="det-label">
										Horas disponibles al día
										<input className="det-input" type="number" name="limite_horas_diarias" value={formEvento.limite_horas_diarias} onChange={handleEventoChange} min="1" max="24" required />
									</label>
								</div>
								{formError && <p className="det-form-error" role="alert">{formError}</p>}
								<button className="continue-button det-btn-guardar" type="submit">Guardar cambios →</button>
							</form>
						)}

						{/* ── Barra de progreso ── */}
						{tareas.length > 0 && (
							<div className="prog-barra-wrap det-barra">
								<div className="prog-barra">
									<div className="prog-barra-fill" style={{ width: `${pct}%` }} />
								</div>
								<span className="prog-barra-pct">{pct}%</span>
							</div>
						)}

						{/* ── Formulario nueva tarea ── */}
						{abrirForm && (
							<form className="det-form" onSubmit={handleAgregarTarea}>
								<h2 className="det-form-titulo">Nueva tarea</h2>
								<div className="det-form-grid">
									<label className="det-label">
										Nombre de la tarea
										<input
											className="det-input"
											name="titulo"
											value={form.titulo}
											onChange={handleChange}
											placeholder="Ej. Contratar catering"
											maxLength={200}
											required
										/>
									</label>
									<label className="det-label">
										Fecha objetivo
										<input
											className="det-input"
											type="date"
											name="fecha_asignada"
											value={form.fecha_asignada}
											onChange={handleChange}
											required
										/>
									</label>
									<label className="det-label">
										Horas estimadas
										<input
											className="det-input"
											type="number"
											name="horas_estimadas"
											value={form.horas_estimadas}
											onChange={handleChange}
											min="0.5"
											max="24"
											step="0.5"
											placeholder="Ej. 2"
											required
										/>
									</label>
									<label className="det-label">
										Prioridad
										<select
											className="det-input"
											name="prioridad"
											value={form.prioridad}
											onChange={handleChange}
										>
											<option value="NORMAL">Normal</option>
											<option value="ALTA">Alta</option>
											<option value="CRITICA">Crítica</option>
										</select>
									</label>
								</div>
								{formError && <p className="det-form-error" role="alert">{formError}</p>}
								<button
									className="continue-button det-btn-guardar"
									type="submit"
									disabled={guardando}
								>
									{guardando ? 'Guardando…' : 'Agregar tarea →'}
								</button>
							</form>
						)}

						{/* ── Lista de tareas ── */}
						<section className="det-tareas-section">
							<h2 className="det-tareas-titulo">
								Tareas
								{tareas.length > 0 && <span className="prog-badge badge-proxima">{tareas.length}</span>}
							</h2>

							{tareas.length === 0 && (
								<div className="det-sin-tareas">
									<p>Este evento aún no tiene tareas.</p>
									<button
										className="prog-action prog-action-primary"
										onClick={() => setAbrirForm(true)}
									>
										+ Agregar la primera tarea
									</button>
								</div>
							)}

							<div className="det-tareas-lista">
								{tareas.map(t => (
									<TareaFila
										key={t.id}
										tarea={t}
										onEstado={handleEstado}
										onEliminar={handleEliminar}
									/>
								))}
							</div>
						</section>
					</>
				)}
			</div>
		</main>
	);
}