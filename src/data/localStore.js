const USERS_KEY = 'eventpro_users';
const SESSION_KEY = 'eventpro_session';
const DATA_PREFIX = 'eventpro_data_';
const DEFAULT_USER = { name: 'Harry', email: 'harry@gmail.com', password: 'harry1234' };

function readJson(key, fallback) {
	try {
		const value = localStorage.getItem(key);
		return value ? JSON.parse(value) : fallback;
	} catch {
		return fallback;
	}
}

function writeJson(key, value) {
	localStorage.setItem(key, JSON.stringify(value));
}

async function hashPassword(password) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
	return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function getDataKey() {
	const user = getCurrentUser();
	if (!user) throw new Error('Inicia sesión para continuar.');
	return `${DATA_PREFIX}${encodeURIComponent(user.email)}`;
}

function getData() {
	return readJson(getDataKey(), { eventos: [], novedades: [], nextEventId: 1, nextTaskId: 1, nextNewsId: 1 });
}

function saveData(data) {
	writeJson(getDataKey(), data);
}

function addNews(data, novelty) {
	data.novedades.unshift({
		id: data.nextNewsId++,
		fecha: new Date().toISOString(),
		...novelty,
	});
	data.novedades = data.novedades.slice(0, 50);
}

export function getCurrentUser() {
	return readJson(SESSION_KEY, null);
}

export async function registerUser({ name, email, password }) {
	const users = readJson(USERS_KEY, []);
	const normalizedEmail = email.trim().toLowerCase();
	if (normalizedEmail === DEFAULT_USER.email || users.some((user) => user.email === normalizedEmail)) {
		throw new Error('Ya existe una cuenta con ese correo electrónico.');
	}
	const user = { name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password) };
	writeJson(USERS_KEY, [...users, user]);
	return user;
}

export async function loginUser({ email, password }) {
	const normalizedEmail = email.trim().toLowerCase();
	if (normalizedEmail === DEFAULT_USER.email && password === DEFAULT_USER.password) {
		const session = { name: DEFAULT_USER.name, email: DEFAULT_USER.email };
		writeJson(SESSION_KEY, session);
		return session;
	}
	const passwordHash = await hashPassword(password);
	const user = readJson(USERS_KEY, []).find(
		item => item.email === normalizedEmail && item.passwordHash === passwordHash,
	);
	if (!user) throw new Error('Correo o contraseña incorrectos.');
	const session = { name: user.name, email: user.email };
	writeJson(SESSION_KEY, session);
	return session;
}

export function logoutUser() {
	localStorage.removeItem(SESSION_KEY);
}

export function getEvents() {
	return getData().eventos;
}

export function getEvent(id) {
	return getEvents().find(evento => evento.id === Number(id)) || null;
}

export function createEvent(values) {
	const data = getData();
	const evento = {
		id: data.nextEventId++,
		fecha_creacion: new Date().toISOString(),
		nombre: values.nombre,
		fecha_evento: values.fecha_evento || null,
		hora_evento: values.hora_evento || null,
		limite_horas_diarias: Number(values.limite_horas_diarias) || 6,
		tareas: [],
	};
	data.eventos.unshift(evento);
	addNews(data, { tipo: 'EVENTO_CREADO', evento: evento.id, evento_nombre: evento.nombre });
	saveData(data);
	return evento;
}

export function updateEvent(id, changes) {
	const data = getData();
	const evento = data.eventos.find(item => item.id === Number(id));
	if (!evento) throw new Error('No se encontró el evento.');
	Object.assign(evento, changes);
	addNews(data, { tipo: 'EVENTO_EDITADO', evento: evento.id, evento_nombre: evento.nombre });
	saveData(data);
	return evento;
}

export function deleteEvent(id) {
	const data = getData();
	data.eventos = data.eventos.filter(evento => evento.id !== Number(id));
	saveData(data);
}

export function createTask(values) {
	const data = getData();
	const evento = data.eventos.find(item => item.id === Number(values.evento));
	if (!evento) throw new Error('No se encontró el evento.');
	const tarea = {
		id: data.nextTaskId++,
		titulo: values.titulo,
		fecha_asignada: values.fecha_asignada,
		hora_asignada: values.hora_asignada || null,
		horas_estimadas: Number(values.horas_estimadas),
		prioridad: values.prioridad || 'NORMAL',
		estado: 'PENDIENTE',
		note: '',
		done_at: null,
	};
	evento.tareas.push(tarea);
	addNews(data, {
		tipo: 'SUBTAREA_AGREGADA',
		evento: evento.id,
		evento_nombre: evento.nombre,
		subtarea_titulo: tarea.titulo,
	});
	saveData(data);
	return tarea;
}

export function updateTask(id, changes) {
	const data = getData();
	let eventId;
	let updatedTask;
	for (const evento of data.eventos) {
		const tarea = evento.tareas.find(item => item.id === Number(id));
		if (!tarea) continue;
		const wasDone = tarea.estado === 'HECHO';
		Object.assign(tarea, changes);
		if (changes.estado === 'HECHO') tarea.done_at = new Date().toISOString();
		else if (changes.estado) tarea.done_at = null;
		if (!wasDone && tarea.estado === 'HECHO') {
			addNews(data, {
				tipo: 'SUBTAREA_COMPLETADA',
				evento: evento.id,
				evento_nombre: evento.nombre,
				subtarea_titulo: tarea.titulo,
			});
		}
		eventId = evento.id;
		updatedTask = tarea;
		break;
	}
	if (!updatedTask) throw new Error('No se encontró la subtarea.');
	saveData(data);
	return { evento: getEvent(eventId), tarea: updatedTask };
}

export function deleteTask(id) {
	const data = getData();
	for (const evento of data.eventos) {
		evento.tareas = evento.tareas.filter(tarea => tarea.id !== Number(id));
	}
	saveData(data);
}

export function getNews() {
	return getData().novedades;
}