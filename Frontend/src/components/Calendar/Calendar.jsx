import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Container, Row, Col, Button, Form, Modal } from 'react-bootstrap';
import './Calendar.css'; // Importar el CSS proporcionado
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Estilos base de react-big-calendar

const localizer = momentLocalizer(moment);

// Datos iniciales de turnos
const initialAppointments = [
  { id: 1, title: 'Dr. Smith', start: new Date(), end: new Date() },
  { id: 2, title: 'Dra. López', start: new Date(new Date().setDate(new Date().getDate() + 1)), end: new Date(new Date().setDate(new Date().getDate() + 1)) },
];

const MyCalendar = () => {
  const [events, setEvents] = useState(initialAppointments);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ id: null, title: '', start: new Date(), end: new Date() });
  const [isEditing, setIsEditing] = useState(false);

  // Abrir modal para agregar o editar turno
  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({ id: null, title: '', start, end });
    setIsEditing(false);
    setShowModal(true);
  };

  // Seleccionar un turno existente para editar o eliminar
  const handleSelectEvent = (event) => {
    setNewEvent({ ...event });
    setIsEditing(true);
    setShowModal(true);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  // Agregar o actualizar turno
  const handleSaveEvent = () => {
    if (!newEvent.title) return alert('Por favor, ingrese el nombre del doctor.');

    if (isEditing) {
      setEvents(events.map((ev) => (ev.id === newEvent.id ? newEvent : ev)));
    } else {
      setEvents([...events, { ...newEvent, id: events.length + 1 }]);
    }
    setShowModal(false);
    setNewEvent({ id: null, title: '', start: new Date(), end: new Date() });
  };

  // Eliminar turno
  const handleDeleteEvent = () => {
    setEvents(events.filter((ev) => ev.id !== newEvent.id));
    setShowModal(false);
    setNewEvent({ id: null, title: '', start: new Date(), end: new Date() });
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setNewEvent({ id: null, title: '', start: new Date(), end: new Date() });
  };

  return (
    <Container fluid className="b-calendar">
      <Row>
        {/* Panel de información (similar al diseño original) */}
        <Col lg={4} className="b-calendar__information">
          <div className="selected-date">
            <div>
              <span className="weekday">{moment().format('dddd').charAt(0).toUpperCase() + moment().format('dddd').slice(1)}</span>
            </div>
            <span className="day">{moment().format('D')}</span>
            <span className="month">{moment().format('MMMM').charAt(0).toUpperCase() + moment().format('MMMM').slice(1)}</span>
          </div>
          <div className="b-event-container">
            <h4>Turnos:</h4>
            <Button variant="primary" onClick={() => handleSelectSlot({ start: new Date(), end: new Date() })}>
              Agregar Turno
            </Button>
            <ul className="event-list">
              {events.map((event) => (
                <li key={event.id} className={`event ${event.completed ? 'completed' : ''}`}>
                  <span className="title">{event.title}</span>
                  <div className="buttons">
                    <Button
                      className="completed-event-btn"
                      onClick={() => setEvents(events.map((ev) => (ev.id === event.id ? { ...ev, completed: !ev.completed } : ev)))}
                    >
                      <i className={`fa ${event.completed ? 'fa-check-square' : 'fa-square-o'}`} aria-hidden="true"></i>
                    </Button>
                    <Button className="delete-event-btn" onClick={() => handleSelectEvent(event)}>
                      <i className="fa fa-trash" aria-hidden="true"></i>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            {events.length === 0 && <div className="no-events text-center">La lista de turnos está vacía...</div>}
          </div>
        </Col>
        {/* Calendario */}
        <Col lg={8} className="b-calendar__calendar">
          <Calendar
            className="calendar"
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView="month"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            style={{ height: '40rem' }}
          />
        </Col>
      </Row>

      {/* Modal para agregar/editar turnos */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar Turno' : 'Agregar Turno'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Doctor</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre del doctor"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Fecha de Inicio</Form.Label>
              <Form.Control
                type="datetime-local"
                name="start"
                value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Fecha de Fin</Form.Label>
              <Form.Control
                type="datetime-local"
                name="end"
                value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {isEditing && (
            <Button variant="danger" onClick={handleDeleteEvent}>
              Eliminar
            </Button>
          )}
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveEvent}>
            {isEditing ? 'Actualizar' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyCalendar;