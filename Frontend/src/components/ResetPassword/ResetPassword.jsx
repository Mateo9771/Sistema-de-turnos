import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from '../../api/axios.api.jsx'; // Usa la instancia personalizada
import './ResetPassword.css'; // Asegúrate de crear este archivo si no existe

const ResetPassword = () => {
  const { token } = useParams(); // Obtener el token de la URL
  const [newPassword, setNewPassword] = useState(''); // Estado para la nueva contraseña
  const [confirmPassword, setConfirmPassword] = useState(''); // Estado para confirmar la contraseña
  const [message, setMessage] = useState(''); // Estado para mensajes de éxito
  const [error, setError] = useState(''); // Estado para mensajes de error

  // Validar la contraseña con una expresión regular
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Validar la contraseña con la expresión regular
    if (!validatePassword(newPassword)) {
      setError(
        'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*).'
      );
      return;
    }

    try {
      const response = await axios.post('/reset-password/reset', {
        token,
        newPassword,
      }); // Usa la instancia de axios con baseURL
      setMessage(response.data.message || 'Contraseña restablecida con éxito.');
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al restablecer la contraseña');
      setMessage('');
    }
  };

  return (
    <Container fluid className="login-container">
      <Card className="login-card">
        <Card.Body>
          <Card.Title className="login-title">Restablecer Contraseña</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingrese su nueva contraseña"
                required
                autoComplete="new-password"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirmar Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita su nueva contraseña"
                required
                autoComplete="new-password"
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="login-button">
              Restablecer Contraseña
            </Button>
          </Form>
          {message && <Alert variant="success" className="mt-3">{message}</Alert>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResetPassword;