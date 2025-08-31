// TURNERO\Frontend\src\components\Navbar\Navbar.jsx
import { useContext } from 'react';
import { Navbar as BootstrapNavbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../../App';
import './Navbar.css';

const Navbar = () => {
  const { role, handleLogout } = useContext(RoleContext);
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate('/', { replace: true });
  };

  return (
    <BootstrapNavbar  variant="dark" expand="lg" className="mb-4 navbar-custom">
      <BootstrapNavbar.Brand href="/home">Turnero</BootstrapNavbar.Brand>
      <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
      <BootstrapNavbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {role && (
            <>
              <Nav.Link href="/home">Inicio</Nav.Link>
              <Nav.Link href="/book">Reservar Turno</Nav.Link>
              {role === 'admin' && (
                <>
                  <Nav.Link href="/appointment">Lista de Turnos</Nav.Link>
                  <Nav.Link href="/calendar">Calendario</Nav.Link>
                </>
              )}
            </>
          )}
        </Nav>
        {role && (
          <Button variant="outline-light" onClick={onLogout}>
            Cerrar Sesión
          </Button>
        )}
      </BootstrapNavbar.Collapse>
    </BootstrapNavbar>
  );
};

export default Navbar;