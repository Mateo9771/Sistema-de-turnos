import {useEffect, useState, useContext} from 'react';
import axios from '../../api/axios.api.jsx';
import { useNavigate } from 'react-router-dom';
import { format, formatInTimeZone, toDate } from 'date-fns-tz';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { RoleContext } from '../../App.jsx';
import './BookAppointment.css'

const BookAppointment = () => {
    const { role } = useContext(RoleContext); // Obtener el rol del usuario desde el contexto
    const navigate = useNavigate()//para redirigir
    const [form, setForm] = useState({
        doctor:'',
        date:'',
        time: '08:00', 
        notes:'',
        patient_name:'',
        patient_email:'',
    });//estado para el formulario

    const [doctors, setDoctors] = useState([]) //almacenar la lista de doctores

    const [error, setError] = useState(null); // Estado para manejar errores
    // Zona horaria local
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
        return times;
    };

    //obtener lista de doctores del back
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get('/appointments/doctors');
                setDoctors(response.data)
            } catch(error) {
                console.error('Error al obtener la lista de doctores', error)
                setError('Error al obtener la lista de doctores');
            }
        };
        fetchDoctors()
    }, []);

      const validateEmail = (email) => {
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(email);
        };
    // Manejar cambios en los campos del formulario
     const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => {
            const newForm = { ...prev, [name]: value };

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
    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (!form.date || !form.time) {
                setError('Por favor selecciona una fecha y hora');
                return;
            }

             if (role === 'admin' && form.patient_email && !validateEmail(form.patient_email)) {
                setError('Por favor, ingrese un correo electrónico válido para el paciente');
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
                ...(role === 'admin' && form.patient_name ? { patient_name: form.patient_name } : {}),
                ...(role === 'admin' && form.patient_email ? { patient_email: form.patient_email } : {}),
            };

            const response = await axios.post('/appointments', appointmentData);
            console.log('Respuesta del backend:', response.data);
            alert('Turno reservado con éxito');
            navigate('/appointments');
        } catch (error) {
            console.error('Error al reservar turno:', error);
            setError(error.response?.data?.message || 'Error al reservar turno');
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
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
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
                    value={form.date}
                    onChange={handleChange}
                    required
                    min={format(new Date(), 'yyyy-MM-dd')}
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

                {role === 'admin' && (
                  <>
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
                    <Form.Group controlId="patientEmailInput" className="mb-3">
                      <Form.Label>Correo del Paciente (Opcional)</Form.Label>
                      <Form.Control
                        type="email"
                        name="patient_email"
                        placeholder="Correo del paciente"
                        value={form.patient_email}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </>
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