// TURNERO\Frontend\src\App.jsx
import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
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

  const checkSession = async () => {
    try {
      const { data } = await axios.get('/sessions/current', { withCredentials: true });
      if (data && data.role) {
        setRole(data.role);
        setIsAuthenticated(true);
        localStorage.setItem('userRole', data.role);
      } else {
        setRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error.response?.status, error.response?.data);
      setRole(null);
      setIsAuthenticated(false);
      localStorage.removeItem('userRole');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('/sessions/logout', { withCredentials: true });
    } catch (err) {
      console.error('Error al cerrar sesión:', err.response?.status, err.response?.data);
    }
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userRole');
    window.location.replace('/'); 
  };

  return (
    <RoleContext.Provider value={{ role, setRole, isAuthenticated, handleLogout }}>
      <Router>
        <AppContent checkSession={checkSession} isLoading={isLoading} isAuthenticated={isAuthenticated} />
      </Router>
    </RoleContext.Provider>
  );
}

function AppContent({ checkSession, isLoading, isAuthenticated }) {
  const location = useLocation();

  useEffect(() => {
    console.log('Verificando sesión para ruta:', location.pathname)
    if (location.pathname !== '/request-reset-password' && location.pathname !== '/reset-password/:token') {
      checkSession();
    } else {
      setIsLoading(false);
    }
  }, [location.pathname, checkSession]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />} />
        <Route path="/home" element={<ProtectedRoute component={Home} allowedRoles={['admin', 'user']} />} />
        <Route path="/book" element={<ProtectedRoute component={BookAppointment} allowedRoles={['admin', 'user']} />} />
        <Route path="/appointment" element={<ProtectedRoute component={AppointmentList} allowedRoles={['admin']} />} />
        <Route path="/calendar" element={<ProtectedRoute component={MyCalendar} allowedRoles={['admin']} />} />
        <Route path="/request-reset-password" element={<RequestResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/'} replace />} />
      </Routes>
    </>
  );
}

const ProtectedRoute = ({ component: Component, allowedRoles }) => {
  const { role, isAuthenticated } = React.useContext(RoleContext);

  if (isAuthenticated === null) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Component />;
};

export default App;