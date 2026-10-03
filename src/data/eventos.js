const STORAGE_KEY = 'eventpro-eventos';

export function obtenerEventos() {
	try {
		const eventos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
		return Array.isArray(eventos) ? eventos : [];
	} catch {
		return [];
	}
}

function guardarEventos(eventos) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(eventos));
	return eventos;
}

export function crearEvento(datos) {
	const evento = {
		...datos,
		id: Date.now(),
		tareas: [],
		realizado: false,
	};
	guardarEventos([...obtenerEventos(), evento]);
	return evento;
}

export function actualizarEvento(id, cambios) {
	return guardarEventos(obtenerEventos().map((evento) =>
		String(evento.id) === String(id) ? { ...evento, ...cambios } : evento,
	));
}

export function eliminarEvento(id) {
	return guardarEventos(obtenerEventos().filter((evento) => String(evento.id) !== String(id)));
}

export function agregarTarea(eventoId, datos) {
	const tarea = { ...datos, id: Date.now(), estado: 'PENDIENTE' };
	const eventos = obtenerEventos().map((evento) =>
		String(evento.id) === String(eventoId)
			? { ...evento, tareas: [...(evento.tareas || []), tarea] }
			: evento,
	);
	guardarEventos(eventos);
	return tarea;
}

export function actualizarTarea(tareaId, cambios) {
	return guardarEventos(obtenerEventos().map((evento) => ({
		...evento,
		tareas: (evento.tareas || []).map((tarea) =>
			String(tarea.id) === String(tareaId) ? { ...tarea, ...cambios } : tarea,
		),
	})));
}

export function eliminarTarea(tareaId) {
	return guardarEventos(obtenerEventos().map((evento) => ({
		...evento,
		tareas: (evento.tareas || []).filter((tarea) => String(tarea.id) !== String(tareaId)),
	})));
}