import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Container, Row, Col, Modal, Table, Button } from 'react-bootstrap';
import './Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from '../../api/axios.api.jsx';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const [events, setEvents] = useState([]);// Estado para almacenar los turnos
    const [selectedDate, setSelectedDate] = useState(new Date());// Estado para almacenar la fecha seleccionada

    // Obtener turnos al cargar el componente
     useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get("/appointments?noPagination=true", {
                    withCredentials: true,
                });
                console.log("Respuesta de /appointments:", response.data);
                const appointments = response.data.appointments.map((app) => {
                    const startDate = new Date(app.date);
                    if (isNaN(startDate.getTime())) {
                        console.warn(`Fecha inválida en turno ID ${app.id}: ${app.date}`);
                        return null;
                    }
                    return {
                        id: app.id,
                        title: `${app.doctor?.first_name || "Desconocido"} ${
                            app.doctor?.last_name || ""
                        } - ${app.patient_name || "Sin paciente"}`,
                        start: startDate,
                        end: new Date(startDate.getTime() + 60 * 60 * 1000), // +1 hora
                        doctorId: app.doctor?.id || "",
                        patientName: app.patient_name || "",
                    };
                }).filter((app) => app !== null);
                setEvents(appointments);
            } catch (error) {
                console.error("Error al obtener turnos:", error);
                alert(
                    "Error al cargar los turnos: " +
                        (error.response?.data?.message || "Error desconocido")
                );
            }
        };

        fetchAppointments();
    }, []);

    // Manejar la selección de un día
   const handleNavigate = (date, view) => {
        console.log("Navegando a fecha:", date, "Vista:", view);
        setSelectedDate(date);
    };

    return (
        <Container fluid className="b-calendar">
            <Row>
                <Col lg={4} className="b-calendar__information">
                    <div className="selected-date">
                        <div>
                            <span className="weekday">
                                {moment(selectedDate)
                                    .format("dddd")
                                    .charAt(0)
                                    .toUpperCase() +
                                    moment(selectedDate).format("dddd").slice(1)}
                            </span>
                        </div>
                        <span className="day">{moment(selectedDate).format("D")}</span>
                        <span className="month">
                            {moment(selectedDate)
                                .format("MMMM")
                                .charAt(0)
                                .toUpperCase() +
                                moment(selectedDate).format("MMMM").slice(1)}
                        </span>
                    </div>
                    <div className="b-event-container">
                        <h4>Turnos:</h4>
                        <ul className="event-list">
                            {events
                                .filter((event) => moment(event.start).isSame(selectedDate, "day"))
                                .map((event) => (
                                    <li key={event.id} className="event">
                                        <span className="title">{event.title}</span>
                                        <span>{moment(event.start).format("HH:mm")}</span>
                                    </li>
                                ))}
                        </ul>
                        {events.filter((event) =>
                            moment(event.start).isSame(selectedDate, "day")
                        ).length === 0 && (
                            <div className="no-events text-center">
                                No hay turnos para este día...
                            </div>
                        )}
                    </div>
                </Col>
                <Col lg={8} className="b-calendar__calendar">
                    <Calendar
                        className="calendar"
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        views={["month", "week", "day"]}
                        defaultView="month"
                        onNavigate={handleNavigate}
                        style={{ height: "50rem" }}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default MyCalendar;