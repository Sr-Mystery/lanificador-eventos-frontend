const STORAGE_KEY = 'eventpro-mock-store-v1';

function getTodayISO() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function createTask({ id, titulo, fecha_asignada, hora_asignada, horas_estimadas, prioridad = 'NORMAL', estado = 'PENDIENTE' }) {
  return {
    id,
    titulo,
    fecha_asignada,
    hora_asignada,
    horas_estimadas,
    prioridad,
    estado,
  };
}

function buildDefaultState() {
  const today = getTodayISO();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  const now = new Date().toISOString();

  return {
    users: [
      {
        id: 1,
        name: 'Demo Usuario',
        email: 'demo@eventpro.com',
        password: 'demo1234',
      },
    ],
    events: [
      {
        id: 1,
        nombre: 'Cumpleaños de Laura',
        fecha_evento: today,
        hora_evento: '20:00',
        limite_horas_diarias: 6,
        createdAt: now,
        updatedAt: now,
        tareas: [
          createTask({ id: 101, titulo: 'Confirmar invitados', fecha_asignada: today, hora_asignada: '18:00', horas_estimadas: 1, prioridad: 'ALTA', estado: 'PENDIENTE' }),
          createTask({ id: 102, titulo: 'Elegir pastel', fecha_asignada: tomorrowISO, hora_asignada: '15:30', horas_estimadas: 2, prioridad: 'MEDIA', estado: 'PENDIENTE' }),
          createTask({ id: 103, titulo: 'Reservar música', fecha_asignada: today, hora_asignada: '17:45', horas_estimadas: 1, prioridad: 'ALTA', estado: 'HECHO' }),
        ],
      },
      {
        id: 2,
        nombre: 'Evento corporativo',
        fecha_evento: tomorrowISO,
        hora_evento: '10:00',
        limite_horas_diarias: 8,
        createdAt: now,
        updatedAt: now,
        tareas: [
          createTask({ id: 201, titulo: 'Preparar agenda', fecha_asignada: today, hora_asignada: '09:00', horas_estimadas: 2, prioridad: 'ALTA', estado: 'EN_PROGRESO' }),
          createTask({ id: 202, titulo: 'Enviar recordatorio', fecha_asignada: tomorrowISO, hora_asignada: '08:30', horas_estimadas: 1, prioridad: 'MEDIA', estado: 'PENDIENTE' }),
        ],
      },
    ],
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCurrentUserId() {
  const session = localStorage.getItem('eventpro-session');
  if (!session) return null;

  try {
    const user = JSON.parse(session);
    return user?.id == null ? user?.email || null : String(user.id);
  } catch {
    return null;
  }
}

function belongsToUser(event, userId) {
  return userId !== null && String(event.owner_id ?? '1') === String(userId);
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state = JSON.parse(raw);
      let migrated = false;
      for (const event of state.events || []) {
        if (event.owner_id == null) {
          event.owner_id = '1';
          migrated = true;
        }
      }
      if (migrated) writeState(state);
      return state;
    }
  } catch {
    // Ignore localStorage errors and use the default state.
  }

  const initialState = buildDefaultState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  return initialState;
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getJsonBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function getUrlPath(input) {
  const rawUrl = typeof input === 'string' ? input : input?.url || '';
  return rawUrl.replace(/^https?:\/\/[^/]+/i, '').replace(/\?.*$/, '');
}

function normalizeAuthPayload(data) {
  return {
    name: data.name || data.username || '',
    email: data.email || '',
    password: data.password || '',
  };
}

function handleMockRequest(input, init = {}) {
  const path = getUrlPath(input);
  const method = (init.method || 'GET').toUpperCase();
  const state = readState();
  const userId = getCurrentUserId();

  if (path === '/api/auth/csrf/' || path === '/api/auth/csrf') {
    return jsonResponse({ csrfToken: 'eventpro-local-dev-token' }, 200);
  }

  if (path === '/api/auth/login/' || path === '/api/auth/login') {
    const payload = normalizeAuthPayload(getJsonBody(init.body));
    const user = state.users.find(item => item.email.toLowerCase() === payload.email.toLowerCase() && item.password === payload.password);

    if (!user) {
      return jsonResponse({ message: 'Credenciales inválidas. Revisa tu correo y contraseña.' }, 401);
    }

    return jsonResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      message: 'Sesión iniciada con éxito.',
    }, 200);
  }

  if (path === '/api/auth/register/' || path === '/api/auth/register') {
    const payload = normalizeAuthPayload(getJsonBody(init.body));
    const email = payload.email.trim();
    const password = payload.password;

    if (!payload.name.trim()) {
      return jsonResponse({ message: 'Ingresa tu nombre.' }, 400);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ message: 'Ingresa un correo electrónico válido.' }, 400);
    }

    if (!password || password.length < 8) {
      return jsonResponse({ message: 'La contraseña debe tener al menos 8 caracteres.' }, 400);
    }

    const duplicate = state.users.some(item => item.email.toLowerCase() === email.toLowerCase());
    if (duplicate) {
      return jsonResponse({ message: 'Ya existe una cuenta con ese correo electrónico.' }, 400);
    }

    const user = {
      id: Date.now(),
      name: payload.name.trim(),
      email,
      password,
    };
    state.users.push(user);
    writeState(state);
    return jsonResponse({ id: user.id, name: user.name, email: user.email }, 201);
  }

  if (path === '/api/eventos/' || path === '/api/eventos') {
    if (!userId) return jsonResponse({ detail: 'Inicia sesión para consultar tus eventos.' }, 401);

    if (method === 'GET') {
      return jsonResponse(clone(state.events.filter(event => belongsToUser(event, userId))), 200);
    }

    if (method === 'POST') {
      const payload = getJsonBody(init.body);
      const now = new Date().toISOString();
      const newEvent = {
        id: Date.now(),
        owner_id: userId,
        nombre: payload.nombre || 'Nuevo evento',
        fecha_evento: payload.fecha_evento || null,
        hora_evento: payload.hora_evento || null,
        limite_horas_diarias: Number(payload.limite_horas_diarias || 6),
        createdAt: now,
        updatedAt: now,
        tareas: [],
      };
      state.events.push(newEvent);
      writeState(state);
      return jsonResponse(newEvent, 201);
    }
  }

  const eventoMatch = path.match(/^\/api\/eventos\/(\d+)\/?$/);
  if (eventoMatch) {
    const id = Number(eventoMatch[1]);
    const eventIndex = state.events.findIndex(item => item.id === id && belongsToUser(item, userId));

    if (method === 'GET' && eventIndex >= 0) {
      return jsonResponse(clone(state.events[eventIndex]), 200);
    }

    if (method === 'PATCH' && eventIndex >= 0) {
      const payload = getJsonBody(init.body);
      if (Object.hasOwn(payload, 'limite_horas_diarias')) {
        const limiteHoras = Number(payload.limite_horas_diarias);
        if (!Number.isInteger(limiteHoras) || limiteHoras < 1 || limiteHoras > 24) {
          return jsonResponse({ detail: 'El límite diario debe ser un número entero entre 1 y 24.' }, 400);
        }
        const horasPorFecha = state.events[eventIndex].tareas.reduce((totales, tarea) => {
          totales[tarea.fecha_asignada] = (totales[tarea.fecha_asignada] || 0) + Number(tarea.horas_estimadas || 0);
          return totales;
        }, {});
        const fechaSobreLimite = Object.entries(horasPorFecha).find(([, horas]) => horas > limiteHoras);
        if (fechaSobreLimite) {
          return jsonResponse({ detail: `El ${fechaSobreLimite[0]} ya tiene ${fechaSobreLimite[1]}h asignadas.` }, 400);
        }
      }
      state.events[eventIndex] = {
        ...state.events[eventIndex],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      writeState(state);
      return jsonResponse(clone(state.events[eventIndex]), 200);
    }

    if (method === 'DELETE' && eventIndex >= 0) {
      state.events.splice(eventIndex, 1);
      writeState(state);
      return jsonResponse({ ok: true }, 204);
    }

    return jsonResponse({ detail: 'Evento no encontrado.' }, 404);
  }

  if (path === '/api/tareas/' || path === '/api/tareas') {
    if (!userId) return jsonResponse({ detail: 'Inicia sesión para consultar tus tareas.' }, 401);

    if (method === 'POST') {
      const payload = getJsonBody(init.body);
      const event = state.events.find(item => item.id === Number(payload.evento) && belongsToUser(item, userId));
      if (!event) {
        return jsonResponse({ detail: 'Evento no encontrado.' }, 404);
      }

      const fechaAsignada = payload.fecha_asignada || getTodayISO();
      const horasEstimadas = Number(payload.horas_estimadas || 1);
      const horasDelDia = event.tareas
        .filter(task => task.fecha_asignada === fechaAsignada)
        .reduce((total, task) => total + Number(task.horas_estimadas || 0), horasEstimadas);
      if (horasEstimadas <= 0 || horasDelDia > Number(event.limite_horas_diarias)) {
        return jsonResponse({ detail: `No puedes asignar más de ${event.limite_horas_diarias} horas permitidas al día.` }, 400);
      }

      const newTask = createTask({
        id: Date.now(),
        titulo: payload.titulo || 'Nueva tarea',
        fecha_asignada: fechaAsignada,
        hora_asignada: payload.hora_asignada || null,
        horas_estimadas: horasEstimadas,
        prioridad: payload.prioridad || 'NORMAL',
        estado: payload.estado || 'PENDIENTE',
      });
      event.tareas.push(newTask);
      event.updatedAt = new Date().toISOString();
      writeState(state);
      return jsonResponse(newTask, 201);
    }
  }

  const tareaMatch = path.match(/^\/api\/tareas\/(\d+)\/?$/);
  if (tareaMatch) {
    const id = Number(tareaMatch[1]);
    let task = null;
    let eventOwner = null;

    for (const event of state.events.filter(item => belongsToUser(item, userId))) {
      const found = event.tareas.find(item => item.id === id);
      if (found) {
        task = found;
        eventOwner = event;
        break;
      }
    }

    if (!task || !eventOwner) {
      return jsonResponse({ detail: 'Tarea no encontrada.' }, 404);
    }

    if (method === 'PATCH') {
      const payload = getJsonBody(init.body);
      if (Object.hasOwn(payload, 'fecha_asignada') || Object.hasOwn(payload, 'horas_estimadas')) {
        const fechaAsignada = payload.fecha_asignada ?? task.fecha_asignada;
        const horasEstimadas = Object.hasOwn(payload, 'horas_estimadas')
          ? Number(payload.horas_estimadas)
          : Number(task.horas_estimadas);
        const horasDelDia = eventOwner.tareas
          .filter(item => item.id !== id && item.fecha_asignada === fechaAsignada)
          .reduce((total, item) => total + Number(item.horas_estimadas || 0), horasEstimadas);
        if (horasEstimadas <= 0 || horasDelDia > Number(eventOwner.limite_horas_diarias)) {
          return jsonResponse({ detail: `No puedes asignar más de ${eventOwner.limite_horas_diarias} horas permitidas al día.` }, 400);
        }
      }
      Object.assign(task, payload);
      eventOwner.updatedAt = new Date().toISOString();
      writeState(state);
      return jsonResponse(clone(task), 200);
    }

    if (method === 'DELETE') {
      eventOwner.tareas = eventOwner.tareas.filter(item => item.id !== id);
      eventOwner.updatedAt = new Date().toISOString();
      writeState(state);
      return jsonResponse({ ok: true }, 204);
    }
  }

  return jsonResponse({ detail: 'Ruta no disponible en modo local.' }, 404);
}

export function installMockApi() {
  if (window.__eventproMockApiInstalled) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (...args) => {
    const [input, init = {}] = args;
    const requestUrl = typeof input === 'string' ? input : input?.url || '';
    const shouldUseMock = requestUrl.includes('/api/') || requestUrl.includes('127.0.0.1:8000') || requestUrl.includes('localhost:8000');

    if (!shouldUseMock) {
      return originalFetch(...args);
    }

    try {
      const response = await originalFetch(...args);
      const contentType = response.headers.get('content-type') || '';
      const isHtmlResponse = contentType.includes('text/html');
      const isMockFallbackStatus = response.status === 404 || response.status === 502 || response.status === 503 || response.status === 504;

      if ((response.ok && !isHtmlResponse) || (response.status >= 400 && response.status < 500 && !isMockFallbackStatus && !isHtmlResponse)) {
        return response;
      }

      return handleMockRequest(input, init);
    } catch {
      return handleMockRequest(input, init);
    }
  };

  window.__eventproMockApiInstalled = true;
}

installMockApi();
