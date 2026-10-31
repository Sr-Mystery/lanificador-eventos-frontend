import { useNavigate } from 'react-router-dom';
import { logoutUser } from './data/localStore';

export default function LogoutButton() {
	const navigate = useNavigate();

	function cerrarSesion() {
		logoutUser();
		navigate('/login', { replace: true });
	}

	return (
		<>
			<button className="event-logout" onClick={cerrarSesion} type="button">Cerrar sesión</button>
		</>
	);
}