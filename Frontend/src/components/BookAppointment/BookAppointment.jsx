import {useEffect, useState} from 'react';
import axios from '../../api/axios.api.jsx';
import { useNavigate } from 'react-router-dom';
import './BookAppointment.css'

const BookAppointment = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        doctor:'',
        date:'',
        notes:'',
    });

    const [doctors, setDoctors] = useState([]) //almacenar la lista de doctores

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
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await axios.post('/appointments', form);
            alert('Turno reservado con exito');
            navigate('/appointments');
        } catch (error){
            alert('Error al reservar turno: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    }

  return (
    <div className='bookAppointment'>
        <h2>Reservar turno</h2>
        <form onSubmit={handleSubmit}>
            <select name="doctor" onChange={handleChange} required autoComplete='off'>
                <option value="">Seleccionar Doctor</option>
                {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                        {doctor.first_name}{doctor.last_name}
                    </option>
                ))}
            </select>
            <input type="datetime-local"
            name='date'
            value={form.date}
            onChange={handleChange}
            required
            />
            <textarea 
            name="notes"
            placeholder='Notas'
            value={form.notes}
            onChange={handleChange}
            />
            <button type='submit'>Reservar</button>
        </form>
    </div>
  )
}

export default BookAppointment