const PRIORIDADES = {
  ALTA: { label: 'ALTA', className: 'prioridad-alta' },
  MEDIA: { label: 'MEDIA', className: 'prioridad-media' },
  NORMAL: { label: 'NORMAL', className: 'prioridad-normal' },
  CRITICA: { label: 'CRÍTICA', className: 'prioridad-alta' },
};

export function getPrioridadInfo(prioridad) {
  return PRIORIDADES[prioridad] || PRIORIDADES.NORMAL;
}
