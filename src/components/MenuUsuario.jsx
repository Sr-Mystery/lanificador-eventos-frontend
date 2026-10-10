import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuUsuario.css';

export default function MenuUsuario() {
	const [abierto, setAbierto] = useState(false);
	const contenedorRef = useRef(null);
	const botonRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		function cerrarAlHacerClickFuera(event) {
			if (!contenedorRef.current?.contains(event.target)) setAbierto(false);
		}

		function cerrarConEscape(event) {
			if (event.key === 'Escape') {
				setAbierto(false);
				botonRef.current?.focus();
			}
		}

		document.addEventListener('pointerdown', cerrarAlHacerClickFuera);
		document.addEventListener('keydown', cerrarConEscape);
		return () => {
			document.removeEventListener('pointerdown', cerrarAlHacerClickFuera);
			document.removeEventListener('keydown', cerrarConEscape);
		};
	}, []);

	function cerrarSesion() {
		localStorage.removeItem('eventpro-session');
		setAbierto(false);
		navigate('/login', { replace: true });
	}

	return (
		<div className="user-menu" ref={contenedorRef}>
			<button
				aria-expanded={abierto}
				aria-haspopup="true"
				aria-label="Abrir menú de usuario"
				className="event-user-mark user-menu-trigger"
				onClick={() => setAbierto(value => !value)}
				ref={botonRef}
				title="Menú de usuario"
				type="button"
			>
				EP
			</button>
			{abierto && (
				<div className="user-menu-popover">
					<button className="user-menu-logout" onClick={cerrarSesion} type="button">
						Cerrar sesión
					</button>
				</div>
			)}
		</div>
	);
}
