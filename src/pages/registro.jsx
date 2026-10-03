import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './loguin.css';

function validate(values) {
	const errors = {};

	if (!values.name.trim()) {
		errors.name = 'Ingresa tu nombre.';
	}

	if (!values.email.trim()) {
		errors.email = 'Ingresa tu correo electrónico.';
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
		errors.email = 'Ingresa un correo electrónico válido.';
	}

	if (!values.password) {
		errors.password = 'Ingresa una contraseña.';
	} else if (values.password.length < 8) {
		errors.password = 'La contraseña debe tener al menos 8 caracteres.';
	}

	if (!values.confirmPassword) {
		errors.confirmPassword = 'Confirma tu contraseña.';
	} else if (values.password !== values.confirmPassword) {
		errors.confirmPassword = 'Las contraseñas no coinciden.';
	}

	return errors;
}

export default function Registro() {
	const navigate = useNavigate();
	const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' });
	const [errors, setErrors] = useState({});
	const [status, setStatus] = useState('idle');

	function handleChange(event) {
		const { name, value } = event.target;
		setValues((current) => ({ ...current, [name]: value }));
		setErrors((current) => ({ ...current, [name]: '' }));
		if (status === 'success') setStatus('idle');
	}

	async function handleSubmit(event) {
		event.preventDefault();
		const validationErrors = validate(values);
		setErrors(validationErrors);
		if (Object.keys(validationErrors).length > 0) {
			setStatus('idle');
			return;
		}

		setStatus('success');
	}

	return (
		<main className="login-page">
			<section className="login-panel" aria-labelledby="register-title">
				<Link className="login-brand" to="/login" aria-label="EventPro, inicio de sesión">
					<span className="brand-mark" aria-hidden="true">E</span>
					<span>EventPro</span>
				</Link>

				<div className="login-content">
					<p className="login-eyebrow">Tu espacio de trabajo</p>
					<h1 id="register-title">Empieza a planificar.</h1>
					<p className="login-intro">Crea tu cuenta para organizar cada detalle de tus eventos.</p>

					{status === 'success' ? (
						<div className="login-success" role="status" aria-live="polite">
							<span className="success-icon" aria-hidden="true">✓</span>
							<h2>Planificador listo</h2>
							<p>Tus eventos se guardarán en este navegador. Ya puedes comenzar.</p>
							<button className="login-submit" type="button" onClick={() => navigate('/hoy')}>
								Ir al planificador
							</button>
						</div>
					) : (
						<form className="login-form" onSubmit={handleSubmit} noValidate>
							<div className="form-field">
								<label htmlFor="name">Nombre</label>
								<input id="name" name="name" type="text" autoComplete="name" value={values.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} disabled={status === 'loading'} placeholder="Tu nombre" />
								{errors.name && <p className="field-error" id="name-error">{errors.name}</p>}
							</div>

							<div className="form-field">
								<label htmlFor="email">Correo electrónico</label>
								<input id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} disabled={status === 'loading'} placeholder="nombre@correo.com" />
								{errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
							</div>

							<div className="form-field">
								<label htmlFor="password">Contraseña</label>
								<input id="password" name="password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} disabled={status === 'loading'} placeholder="Al menos 8 caracteres" />
								{errors.password && <p className="field-error" id="password-error">{errors.password}</p>}
							</div>

							<div className="form-field">
								<label htmlFor="confirmPassword">Confirmar contraseña</label>
								<input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={handleChange} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined} disabled={status === 'loading'} placeholder="Repite tu contraseña" />
								{errors.confirmPassword && <p className="field-error" id="confirm-password-error">{errors.confirmPassword}</p>}
							</div>

							<button className="login-submit" type="submit">
								Crear cuenta
							</button>
							<p className="auth-switch">
								¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
							</p>
						</form>
					)}
				</div>

				<p className="login-footer">EventPro: cada detalle, bajo control.</p>
			</section>

			<aside className="login-aside" aria-label="Organización de eventos">
				<div className="aside-grid" aria-hidden="true" />
				<div className="aside-copy">
					<span className="aside-kicker">Menos pendientes, más celebración</span>
					<p>Todo tu evento,<br />en buenas manos.</p>
					<span className="aside-caption">Ideas claras. Días memorables.</span>
				</div>
				<div className="aside-stamp" aria-hidden="true">P</div>
			</aside>
		</main>
	);
}
