  //TURNERO\Frontend\src\components\login\login.jsx
// TURNERO\Frontend\src\components\login\login.jsx
import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card, ToggleButton } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios.api.jsx';
import { RoleContext } from '../../App';
import './login.css';

const Login = () => {
  const { setRole } = useContext(RoleContext);
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    // Validaciones básicas
    if (form.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      alert('Por favor, ingrese un email válido.');
      return;
    }
    const formWithRole = { ...form, role: 'user' };
    try {
      await axios.post('/sessions/register', formWithRole);
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
    try {
      await axios.post('/sessions/login', {
        email: form.email,
        password: form.password,
      });
      const { data } = await axios.get('/sessions/current');
      if (!data || !data.role) {
        throw new Error('Respuesta del servidor inválida: rol no encontrado');
      }
      setRole(data.role); // Establecer el rol en el contexto
      navigate('/home');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert('Sesión no válida. Por favor, intenta iniciar sesión nuevamente.');
      } else {
        alert('Error al iniciar sesión: ' + (err.response?.data?.message || 'Credenciales inválidas'));
      }
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
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" className="login-button">
                Iniciar Sesión
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;