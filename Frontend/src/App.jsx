// TURNERO\Frontend\src\App.jsx
import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from 'react';
import Login from './components/login/login';
import Home from './components/home/home.jsx';
import BookAppointment from './components/bookAppointment/BookAppointment';
import AppointmentList from './components/AppointmentList/AppointmentList';
import MyCalendar from './components/Calendar/Calendar';
import Navbar from './components/Navbar/Navbar';
import RequestResetPassword from './components/RequesResetPassword/RequesResetPassword.jsx';
import ResetPassword from './components/ResetPassword/ResetPassword.jsx';
import axios from './api/axios.api.jsx';

export const RoleContext = React.createContext();

function App() {
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  // Usar useCallback para memoizar la función
  const checkSession = useCallback(async () => {
    try {
      const { data } = await axios.get('/sessions/current', { withCredentials: true });
      if (data && data.role) {
        setRole(data.role);
        setIsAuthenticated(true);
        localStorage.setItem('userRole', data.role);
      } else {
        throw new Error('No role found');
      }
    } catch (error) {
      console.log('Error al verificar sesión:', error.response?.status || error.message);
      setRole(null);
      setIsAuthenticated(false);
      localStorage.removeItem('userRole');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
      setSessionChecked(true);
    }
  }, []);
// Función para manejar el logout
 const handleLogout = async () => {
  try {
    await axios.get('/sessions/logout', { withCredentials: true });
  } catch (err) {
    console.error('Error al cerrar sesión:', err.response?.status, err.response?.data);
  }
  setRole(null);
  setIsAuthenticated(false);
  setSessionChecked(false);
  localStorage.removeItem('userRole');
  localStorage.removeItem('token');
  // Reemplazar el historial con la página de login
  window.history.pushState(null, '', '/');
  window.history.pushState(null, '', '/');
  window.history.go(-1);
};
// Efecto para verificar la sesión al montar el componente
  return (
    <RoleContext.Provider value={{ role, setRole, isAuthenticated, setIsAuthenticated, handleLogout }}>
      <Router>
        <AppContent
          checkSession={checkSession}
          isLoading={isLoading}
          isAuthenticated={isAuthenticated}
          sessionChecked={sessionChecked}
        />
      </Router>
    </RoleContext.Provider>
  );
}
// Componente separado para manejar las rutas y la lógica de sesión
function AppContent({ checkSession, isLoading, isAuthenticated, sessionChecked }) {
  const location = useLocation();

  useEffect(() => {
    console.log('Verificando sesión para ruta:', location.pathname);
    if (location.pathname === '/request-reset-password' || location.pathname.startsWith('/reset-password/')) {
      setIsLoading(false);
      return;
    }
    if (!sessionChecked && isAuthenticated === null) {
      checkSession();
    } else if (sessionChecked && isAuthenticated === false && location.pathname !== '/') {
      setTimeout(() => window.location.href = '/', 100);
    }
  }, [location.pathname, checkSession, isAuthenticated, sessionChecked]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/home" element={<ProtectedRoute component={Home} allowedRoles={['admin', 'user']} checkSession={checkSession} />} />
        <Route path="/book" element={<ProtectedRoute component={BookAppointment} allowedRoles={['admin', 'user']} checkSession={checkSession} />} />
        <Route path="/appointment" element={<ProtectedRoute component={AppointmentList} allowedRoles={['admin']} checkSession={checkSession} />} />
        <Route path="/calendar" element={<ProtectedRoute component={MyCalendar} allowedRoles={['admin']} checkSession={checkSession} />} />
        <Route path="/request-reset-password" element={<RequestResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/'} replace />} />
      </Routes>
    </>
  );
}
// Componente para rutas protegidas
const ProtectedRoute = ({ component: Component, allowedRoles, checkSession }) => {
  const { role, isAuthenticated } = React.useContext(RoleContext);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
// Efecto para verificar la sesión y el rol
  useEffect(() => {
    if (isAuthenticated === null) {
      checkSession().then(() => {
        setIsVerifying(false);
        setIsValid(isAuthenticated && role && allowedRoles.includes(role));
      });
    } else {
      setIsVerifying(false);
      setIsValid(isAuthenticated && role && allowedRoles.includes(role));
    }
  }, [isAuthenticated, role, allowedRoles, checkSession]);

  if (isVerifying) {
    return <div>Cargando...</div>;
  }

  if (!isValid) {
    return <Navigate to="/" replace />;
  }

  return <Component />;
};

export default App;