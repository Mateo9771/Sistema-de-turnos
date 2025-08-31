import {useEffect, useState, useContext} from 'react';
import axios from '../../api/axios.api.jsx';
import { useNavigate } from 'react-router-dom';
import { format, formatInTimeZone, toDate } from 'date-fns-tz';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { RoleContext } from '../../App.jsx';
import './BookAppointment.css'

const BookAppointment = () => {
    const { role } = useContext(RoleContext); 
    const navigate = useNavigate()
    const [form, setForm] = useState({
        doctor:'',
        date:'',
        time: '08:00', 
        notes:'',
        patient_name:'',
    });

    const [doctors, setDoctors] = useState([]) //almacenar la lista de doctores

    const TIME_ZONE = 'America/Argentina/Buenos_Aires';

     // Generar opciones de hora de 08:00 a 17:00 (cada 30 minutos)
    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 8; hour <= 17; hour++) {
            times.push(`${hour.toString().padStart(2, '0')}:00`);
            if (hour < 17) {
                times.push(`${hour.toString().padStart(2, '0')}:30`);
            }
        }
        return times; // ['08:00', '08:30', '09:00', ..., '17:00']
    };

    //obtener lista de doctores del back
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get('/appointments/doctors');
                setDoctors(response.data)
            } catch(error) {
                console.error('Error al obtener la lista de doctores', error)
            }
        };
        fetchDoctors()
    }, []);

     const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const newForm = { ...prev, [name]: value };

            // Si se cambia la fecha o la hora, combinarlas para depuración
            if (name === 'date' || name === 'time') {
                const dateStr = name === 'date' ? value : prev.date;
                const timeStr = name === 'time' ? value : prev.time;
                if (dateStr && timeStr) {
                    const [hours, minutes] = timeStr.split(':');
                    const combinedDate = new Date(`${dateStr}T${timeStr}:00`);
                    combinedDate.setHours(parseInt(hours), parseInt(minutes));
                    console.log('Fecha y hora combinadas:', combinedDate.toISOString());
                }
            }

            return newForm;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Combinar fecha y hora
            if (!form.date || !form.time) {
                alert('Por favor selecciona una fecha y hora');
                return;
            }

            const [hours, minutes] = form.time.split(':');
            const localDate = new Date(`${form.date}T${form.time}:00`);
            localDate.setHours(parseInt(hours), parseInt(minutes));

            if (isNaN(localDate.getTime())) {
                throw new Error('Fecha inválida');
            }

            const utcDate = formatInTimeZone(localDate, 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");
            console.log('Fecha local:', localDate, 'Fecha UTC:', utcDate);

            const appointmentData = {
                doctor: form.doctor,
                date: utcDate,
                notes: form.notes,
                // Solo incluir patient_name si el usuario es admin y lo especificó
                ...(role === 'admin' && form.patient_name ? { patient_name: form.patient_name } : {}),
            };

            const response = await axios.post('/appointments', appointmentData);
            console.log('Respuesta del backend:', response.data);
            alert('Turno reservado con éxito');
            navigate('/appointments');
        } catch (error) {
            console.error('Error al reservar turno:', error);
            alert('Error al reservar turno: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };


    // Formatear la fecha para el input datetime-local
  const formatDateForInput = (date) => {
    if (!date) return '';
    try {
      const localDate = toDate(date, { timeZone: TIME_ZONE });
      if (isNaN(localDate.getTime())) {
        console.error('Fecha inválida para input:', date);
        return '';
      }
      const formatted = format(localDate, 'yyyy-MM-dd'); 
      console.log('Fecha formateada para input:', formatted); // Depuración
      return formatted;
    } catch (error) {
      console.error('Error formateando fecha para input:', error);
      return '';
    }
  };

  console.log('Rol del usuario:', role); 

  return (
       <Container fluid>
            <Row className="justify-content-center">
                <Col md={8} className="text-center">
                    <Card className="book-appointment-card">
                        <Card.Body className="book-appointment-container">
                            <Card.Title className="book-appointment-title">Reservar Turno</Card.Title>
                            <Card.Text className="book-appointment-text">
                                Selecciona un doctor, fecha y hora, y agrega notas para tu cita.
                            </Card.Text>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group controlId="doctorSelect" className="mb-3">
                                    <Form.Label>Seleccionar Doctor</Form.Label>
                                    <Form.Select
                                        name="doctor"
                                        onChange={handleChange}
                                        value={form.doctor}
                                        required
                                        autoComplete="off"
                                    >
                                        <option value="">Seleccionar Doctor</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor._id} value={doctor._id}>
                                                {doctor.first_name} {doctor.last_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group controlId="dateInput" className="mb-3">
                                    <Form.Label>Fecha</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="date"
                                        value={form.date} // Usar form.date directamente
                                        onChange={handleChange}
                                        required
                                        min={format(new Date(), 'yyyy-MM-dd')} // Solo fechas futuras
                                    />
                                </Form.Group>

                                <Form.Group controlId="timeInput" className="mb-3">
                                    <Form.Label>Hora</Form.Label>
                                    <Form.Select
                                        name="time"
                                        value={form.time}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccionar Hora</option>
                                        {generateTimeOptions().map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                {/* Mostrar campo patient_name solo para administradores */}
                                {role === 'admin' && (
                                    <Form.Group controlId="patientNameInput" className="mb-3">
                                        <Form.Label>Nombre del Paciente (Opcional)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="patient_name"
                                            placeholder="Nombre del paciente"
                                            value={form.patient_name}
                                            onChange={handleChange}
                                        />
                                    </Form.Group>
                                )}

                                <Form.Group controlId="notesTextarea" className="mb-3">
                                    <Form.Label>Notas</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="notes"
                                        placeholder="Notas"
                                        value={form.notes}
                                        onChange={handleChange}
                                        rows={4}
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="book-appointment-button">
                                    Reservar
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
  );
}

export default BookAppointment