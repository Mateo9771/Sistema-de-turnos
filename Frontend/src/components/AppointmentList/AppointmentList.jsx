import {useState, useEffect} from 'react';
import axios from '../../api/axios.api.jsx';
import { useSearchParams } from 'react-router-dom';
import './AppointmentList.css'

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([])
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role'); 

   useEffect(() => {
        const fetchAppointments = async () => {
            try{
                const endpoint = role === 'admin' ? '/appointments' : '/appointments/user';
                const {data} = await axios.get (endpoint);
                console.log('Datos de la API:', data);
                setAppointments(data)
            } catch(error){
                console.error('Error fetching appointments', error);
            }
        };
        fetchAppointments();
    }, [role]) 

  return (
    <div>
            <h2>{role === 'admin' ? 'Todos los Turnos' : 'Mis Turnos'}</h2>
            <ul>
             {appointments.map((appointment) => (
                <li key={appointment.id}>
                 {appointment.doctor?.first_name} {appointment.doctor?.last_name} -{' '}
                {new Date(appointment.date).toLocaleString()} - {appointment.status}
             </li>
  ))}
</ul>
        </div>
  )
}

export default AppointmentList