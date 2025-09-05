import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();// Obtener el token de la URL
    const [newPassword, setNewPassword] = useState('');// Estado para la nueva contraseña
    const [message, setMessage] = useState('');// Estado para mensajes de éxito
    const [error, setError] = useState('');// Estado para mensajes de error
    // Validar la contraseña con una expresión regular
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };
    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword(newPassword)) {
            setError(
                'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*).'
            );
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/reset-password/reset', {
                token,
                newPassword
            },
            { withCredentials: true }
        );
            setMessage(response.data.message);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña');
            setMessage('');
        }
    };

    return (
        <div>
            <h2>Nueva contraseña</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Nueva contraseña:
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value)
                            setError('');
                        }}
                        required
                    />
                </label>
                <button type="submit">Restablecer contraseña</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default ResetPassword;