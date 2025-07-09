// TURNERO\Frontend\src\components\home\home.jsx
import React, { useContext } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../../App';
import './Home.css';

const Home = () => {
  const { role } = useContext(RoleContext);
  const navigate = useNavigate();

  if (!['admin', 'user'].includes(role)) {
    navigate('/');
    return null;
  }

  return (
    <Container fluid className="home-container">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <Card className="home-card">
            <Card.Body>
              <Card.Title className="home-title">
                {role === 'admin' ? 'Bienvenido Administrador' : 'Bienvenido Usuario'}
              </Card.Title>
              <Card.Text className="home-text">
                {role === 'admin'
                  ? 'Gestiona los turnos, visualiza el calendario y organiza las citas.'
                  : 'Reserva tu turno fácilmente y gestiona tus citas médicas.'}
              </Card.Text>
              <div className="home-buttons">
                <Button
                  variant="primary"
                  className="home-button"
                  onClick={() => navigate('/book')}
                >
                  Reservar Turno
                </Button>
                {role === 'admin' && (
                  <>
                    <Button
                      variant="secondary"
                      className="home-button"
                      onClick={() => navigate('/appointment')}
                    >
                      Lista de Turnos
                    </Button>
                    <Button
                      variant="secondary"
                      className="home-button"
                      onClick={() => navigate('/calendar')}
                    >
                      Ver Calendario
                    </Button>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;