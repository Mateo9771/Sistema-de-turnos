import { useState } from "react";
import axios from 'axios';

const RequestResetPassword = () => {
    const [email, setEmail] = useState ('');
    const [message, setMessage] = useState ('');
    const [error, setError] = useState ('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await axios.post('http://localhost:8080/api/reset-password/request', { email });
            setMessage(response.data.message);
            setError('');
        } catch(err) {
            setError(err.response?.data?.message || 'Error al procesar la solicitud');
            setMessage('')
        }
    }
    return(
        <div>
            <h2>Restablecer contraseña</h2>
            <form onSubmit={handleSubmit}>
            <label>
                Correo electronico: 
                <input
                type="email"
                value= {email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </label>
            <button type="submit">Enviar enlace de restablecimiento</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    )
}

export default RequestResetPassword