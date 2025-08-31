// TURNERO\Frontend\src\components\login\login.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Container, Form, Button, Card, ToggleButton, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios.api.jsx';
import { RoleContext } from '../../App';
import './login.css';

const Login = () => {
  const { role, setRole, setIsAuthenticated } = useContext(RoleContext);
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(true);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    age: '',
  });
  const [error, setError] = useState(null);
  

   // Redirigir a usuarios autenticados fuera de la página de login
  useEffect(() => {
    if (role) {
      navigate('/home', { replace: true }); // Usar replace para no añadir al historial
    }
  }, [role, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar error previo
    // Validaciones básicas
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Por favor, ingrese un email válido.');
      return;
    }
    if (!validatePassword(form.password)) {
      setError(
        'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*).'
      );
      return;
    }
    const formWithRole = { ...form, role: 'user' };
    try {
      await axios.post('/sessions/register', formWithRole, { withCredentials: true });
      setError(null); // Limpiar error
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      setIsSignup(false);
      setForm({ first_name: '', last_name: '', email: '', phone: '', password: '', age: '' });
    } catch (err) {
      console.error(err);
      alert('Error al registrarte: ' + (err.response?.data?.message || 'Inténtalo de nuevo.'));
    }
  };

   const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await axios.post(
                '/sessions/login',
                { email: form.email, password: form.password },
                { withCredentials: true }
            );
            console.log('Respuesta de login:', response.data);
            const { token, role, redirect } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);
            setRole(role);
            setIsAuthenticated(true);
            navigate(redirect || '/home', { replace: true });
        } catch (err) {
            console.error('Error en login:', err.response?.data);
            setError(err.response?.data?.message || 'Credenciales inválidas');
        }
    };

  return (
    <Container fluid className="login-container">
      <Card className="login-card">
        <Card.Body>
          <Card.Title className="login-title">{isSignup ? 'Registro' : 'Iniciar Sesión'}</Card.Title>
          <ToggleButton
            id="chk"
            type="checkbox"
            variant="outline-primary"
            checked={!isSignup}
            value="1"
            onChange={() => setIsSignup(!isSignup)}
            className="mb-3"
          >
            {isSignup ? 'Cambiar a Iniciar Sesión' : 'Cambiar a Registro'}
          </ToggleButton>
          {isSignup ? (
            <Form onSubmit={handleSignup}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="first_name"
                  placeholder="Nombre"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="last_name"
                  placeholder="Apellido"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="username" 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  name="phone"
                  placeholder="Teléfono"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  name="age"
                  placeholder="Edad"
                  value={form.age}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password" 
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="login-button">
                Registrarse
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="login-button">
                Iniciar Sesión
              </Button>
            </Form>
          )}
          {error && <div className="error-message">{error}</div>}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;