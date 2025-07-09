// TURNERO\Frontend\src\App.jsx
import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState } from 'react';
import Login from './components/login/login';
import Home from './components/home/home.jsx';
import BookAppointment from './components/bookAppointment/BookAppointment';
import AppointmentList from './components/AppointmentList/AppointmentList';
import MyCalendar from './components/Calendar/Calendar';
import Navbar from './components/Navbar/Navbar';

// Contexto simulado para el rol del usuario
export const RoleContext = React.createContext();

function App() {
  // Estado para simular el rol del usuario (en un sistema real, vendría de un login/auth)
  const [role, setRole] = useState(null); // 'admin' o 'user' tras el login

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute component={Home} allowedRoles={['admin', 'user']} />} />
          <Route path="/book" element={<ProtectedRoute component={BookAppointment} allowedRoles={['admin', 'user']} />} />
          <Route path="/appointment" element={<ProtectedRoute component={AppointmentList} allowedRoles={['admin']} />} />
          <Route path="/calendar" element={<ProtectedRoute component={MyCalendar} allowedRoles={['admin']} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </RoleContext.Provider>
  );
}

// Componente para proteger rutas según el rol
const ProtectedRoute = ({ component: Component, allowedRoles }) => {
  const { role } = React.useContext(RoleContext);
  return allowedRoles.includes(role) ? <Component /> : <Navigate to="/" />;
};

export default App;