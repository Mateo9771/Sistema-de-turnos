import { useState } from "react";
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from '../../api/axios.api.jsx';
import './RequestResetPassword.css';

const RequestResetPassword = () => {
    const [email, setEmail] = useState ('');// Estado para el correo electronico
    const [message, setMessage] = useState ('');// Estado para mensajes de éxito
    const [error, setError] = useState ('');// Estado para mensajes de error

    const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!validateEmail(email)) {
      setError('Por favor, ingrese un email válido.');
      return;
    }
    try {
      const response = await axios.post('/reset-password/request', { email });
      setMessage(response.data.message || 'Enlace de restablecimiento enviado. Revisa tu correo.');
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al procesar la solicitud');
      setMessage('');
    }
  };
    return(
         <Container fluid className="login-container">
      <Card className="login-card">
        <Card.Body>
          <Card.Title className="login-title">Restablecer Contraseña</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingrese su email"
                required
                autoComplete="username"
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="login-button">
              Enviar Enlace de Restablecimiento
            </Button>
          </Form>
          {message && <Alert variant="success" className="mt-3">{message}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Card.Body>
      </Card>
    </Container>
    )
}

export default RequestResetPassword