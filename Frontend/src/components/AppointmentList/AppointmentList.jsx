import {useState, useEffect, useContext, useMemo} from 'react';
import axios from '../../api/axios.api.jsx';
import { Container, Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
import './AppointmentList.css'
import { RoleContext } from '../../App.jsx';

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([])
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { role } = useContext(RoleContext);

   useEffect(() => {
        console.log('Role actual:', role); // Para depuración
        const fetchAppointments = async () => {
            try{
                const endpoint = role === 'admin' ? '/appointments' : '/appointments/user';
                console.log('Endpoint usado:', endpoint); 
                const {data} = await axios.get (endpoint);
                console.log('Datos de la API:', data);
                setAppointments(data)
            } catch(error){
                console.error('Error fetching appointments', error);
            }
        };
        fetchAppointments();
    }, [role]) 

    //Manejar cambios de estado
    const handleStatusChange = async (appointmentId, newStatus) => {
        if (!appointmentId || !/^[0-9a-fA-F]{24}$/.test(appointmentId)) {
            alert('ID de turno inválido');
            return;
        }
        console.log('Actualizando ID de turno:', appointmentId, 'a estado:', newStatus);
        try {
            const response = await axios.put(`/appointments/${appointmentId}`, { status: newStatus }, { withCredentials: true });
            console.log('Estado actualizado:', response.data);
            setAppointments((prev) =>
                prev.map((appt) =>
                    appt.id === appointmentId ? { ...appt, status: newStatus } : appt
                )
            );
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert('Error al actualizar el estado: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };

    //filtrar y ordenar los turnos
    const filteredAndSortedAppointments = useMemo(() => {
      let filtered = [...appointments];

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            alert('La fecha de inicio no puede ser mayor que la fecha de fin');
            return filtered;
        }

      if(startDate){
        const start = new Date(startDate);
        filtered = filtered.filter((appt) => new Date(appt.date) >= start);
      }
      if(endDate){
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        filtered = filtered.filter((appt) => new Date(appt.date) <= end);
      }

      //Filtrar por busqueda
       if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((appt) => {
                const doctorName = `${appt.doctor?.first_name || ''} ${appt.doctor?.last_name || ''}`.toLowerCase();
                const patientName = appt.patient_name
                    ? appt.patient_name.toLowerCase()
                    : appt.user
                    ? `${appt.user.first_name} ${appt.user.last_name}`.toLowerCase()
                    : '';
                const notes = appt.notes ? appt.notes.toLowerCase() : '';
                return (
                    doctorName.includes(query) ||
                    patientName.includes(query) ||
                    notes.includes(query)
                );
            });
        }
         // Ordenar por fecha ascendente
        return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [appointments, startDate, endDate, searchQuery]);


  return (
     <Container fluid className="appointment-list-container">
            <Row className="justify-content-center">
                <Col md={8} className="text-center">
                    <Card className="appointment-list-card">
                        <Card.Body>
                            <Card.Title className="appointment-list-title">
                                {role === 'admin' ? 'Todos los Turnos' : 'Mis Turnos'}
                            </Card.Title>
                            <Card.Text className="appointment-list-text">
                                {role === 'admin'
                                    ? 'Lista de todos los turnos registrados en el sistema.'
                                    : 'Consulta tus turnos programados.'}
                            </Card.Text>

                            {/* Filtros */}
                            <Form className="mb-3">
                                <Row>
                                    <Col md={4}>
                                        <Form.Group controlId="startDate">
                                            <Form.Label>Fecha Desde</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="endDate">
                                            <Form.Label>Fecha Hasta</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="searchQuery">
                                            <Form.Label>Buscar</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Buscar por doctor, paciente o notas"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>

                            <Table striped bordered hover responsive className="appointment-list-table">
                                <thead>
                                    <tr>
                                        <th>Doctor</th>
                                        <th>Paciente</th>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Notas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAndSortedAppointments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                No hay turnos disponibles.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAndSortedAppointments.map((appointment) => (
                                            <tr key={appointment.id}>
                                                <td>
                                                    {appointment.doctor?.first_name}{' '}
                                                    {appointment.doctor?.last_name}
                                                </td>
                                                <td>
                                                    {appointment.patient_name
                                                        ? appointment.patient_name
                                                        : appointment.user
                                                        ? `${appointment.user.first_name} ${appointment.user.last_name}`
                                                        : 'Sin paciente asignado'}
                                                </td>
                                                <td>
                                                    {new Date(appointment.date).toLocaleString('es-AR', {
                                                        timeZone: 'America/Argentina/Buenos_Aires',
                                                        dateStyle: 'short',
                                                        timeStyle: 'short',
                                                    })}
                                                </td>
                                                <td>
                                                    {role === 'admin' ? (
                                                        <Form.Select
                                                            value={appointment.status}
                                                            onChange={(e) =>
                                                                handleStatusChange(appointment.id, e.target.value)
                                                            }
                                                        >
                                                            <option value="pending">Pendiente</option>
                                                            <option value="confirmed">Confirmado</option>
                                                            <option value="cancelled">Cancelado</option>
                                                        </Form.Select>
                                                    ) : (
                                                        appointment.status === 'pending'
                                                        ? 'Pendiente'
                                                        : appointment.status === 'confirmed'
                                                        ? 'Confirmado'
                                                        : 'Cancelado'
                                                    )}
                                                </td>
                                                <td>{appointment.notes || 'Sin notas'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
  )
}

export default AppointmentList