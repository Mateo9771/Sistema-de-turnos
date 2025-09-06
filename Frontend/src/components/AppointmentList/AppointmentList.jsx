import { useState, useEffect, useContext, useMemo } from 'react';
import axios from '../../api/axios.api.jsx';
import { Container, Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
import './AppointmentList.css';
import { RoleContext } from '../../App.jsx';

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [limit] = useState(10);
    const { role } = useContext(RoleContext);

    useEffect(() => {
        console.log('Role actual:', role);
        const fetchAppointments = async () => {
            try {
                let endpoint = role === 'admin' 
                    ? `/appointments?page=${page}&limit=${limit}`
                    : '/appointments/user';
                
                if (role === 'admin') {
                    const params = new URLSearchParams({ page, limit });
                    if (startDate) params.append('startDate', startDate);
                    if (endDate) params.append('endDate', endDate);
                    if (searchQuery) params.append('searchQuery', searchQuery);
                    endpoint = `/appointments?${params.toString()}`;
                }

                console.log('Endpoint usado:', endpoint);
                const { data } = await axios.get(endpoint);
                console.log('Datos de la API:', data);
                
                if (role === 'admin') {
                    setAppointments(data.appointments);
                    setTotalAppointments(data.total);
                } else {
                    setAppointments(data);
                    setTotalAppointments(data.length);
                }
            } catch (error) {
                console.error('Error fetching appointments', error);
            }
        };
        fetchAppointments();
    }, [role, page, limit, startDate, endDate, searchQuery]);

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

    const filteredAppointments = useMemo(() => {
        return appointments; 
    }, [appointments]);

    const totalPages = Math.ceil(totalAppointments / limit);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

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
                                    ? `Lista de todos los turnos registrados en el sistema. Total: ${totalAppointments}`
                                    : 'Consulta tus turnos programados.'}
                            </Card.Text>

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
                                    {filteredAppointments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center">
                                                No hay turnos disponibles.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAppointments.map((appointment) => (
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

                            {role === 'admin' && totalAppointments > 0 && (
                                <div className="pagination-controls mt-3">
                                    <Button
                                        variant="outline-primary"
                                        disabled={page === 1}
                                        onClick={() => handlePageChange(page - 1)}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="mx-3">
                                        Página {page} de {totalPages}
                                    </span>
                                    <Button
                                        variant="outline-primary"
                                        disabled={page === totalPages}
                                        onClick={() => handlePageChange(page + 1)}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AppointmentList;