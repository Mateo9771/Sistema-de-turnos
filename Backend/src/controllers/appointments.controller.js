//TURNERO\Backend\src\controllers\appointments.controller.js
import mongoose from 'mongoose';
import appointmentsDAO from '../services/dao/appointments.dao.js';
import { AppointmentDTO } from '../services/dto/appointments.dto.js';

export const createAppointment = async (req, res) => {
    try {
        console.log('Datos recibidos:', req.body);
        console.log('Usuario autenticado:', req.user);
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const { doctor, date, notes, patient_name } = req.body;

        if (!doctor || !date) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }
         // Validar ObjectId
        if (!mongoose.Types.ObjectId.isValid(doctor)) {
            return res.status(400).json({ message: 'ID de doctor inválido' });
        }

         // Validar fecha
         const appointmentDate = new Date(date);
        if (!date || isNaN(appointmentDate.getTime())) {
        return res.status(400).json({ message: 'Fecha inválida' });
        }

        // Validar que el doctor sea un admin
         const isAdminDoctor = await appointmentsDAO.isAdmin(doctor);
         console.log('Resultado de isAdminDoctor:', isAdminDoctor);
        if (!isAdminDoctor) {
            return res.status(400).json({ message: 'El doctor especificado no es válido' });
        }

        // Validar conflictos de horario
        const existingAppointment = await appointmentsDAO.findAppointmentByDoctorAndDate(doctor, new Date(date));
        if (existingAppointment) {
            return res.status(400).json({ message: 'El horario ya está ocupado' });
        }

        let finalPatientName;
        if (req.user.role === 'admin') {
            // Los administradores pueden especificar patient_name o dejarlo como null
            finalPatientName = patient_name || null;
        } else {
            // Los usuarios no administradores usan su nombre por defecto
            finalPatientName = patient_name || req.user.name || 'Paciente Anónimo';
        }

        const appointmentData = AppointmentDTO.fromRequest({
            user: req.user.id,
            patient_name: finalPatientName,
            doctor,
            date: appointmentDate,
            notes
        });

        const appointment = await appointmentsDAO.createAppointment(appointmentData);
        res.status(201).json(new AppointmentDTO(appointment));
    } catch (error) {
        console.error('Error al crear turno:', error);
        res.status(500).json({ message: 'Error al crear el turno', error: error.message });
    }
};

export const getUserAppointment = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }
        const appointments = await appointmentsDAO.findAppointmentsByUser(req.user.id);
        console.log('Turnos del usuario:', appointments);
        res.status(200).json(appointments.map(app => new AppointmentDTO(app)));
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener turnos', error: error.message });
    }
};

export const getAllAppointments = async (req, res) => {
    try {
        // Verificar si el usuario tiene el rol de admin
        console.log('Usuario autenticado:', req.user); // Agrega esto para depuración
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        const { page = 1, limit = 10 } = req.query;
        
        // Traer todos los turnos
        const appointments = await appointmentsDAO.findAllAppointments();

        // Paginación de los resultados
        const start = (page - 1) * limit;
        const end = start + parseInt(limit);
        const paginated = appointments.slice(start, end);  // Pagina los turnos

        // Devolver los turnos paginados
        res.status(200).json(paginated.map(app => new AppointmentDTO(app)));
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener turnos', error: error.message });
    }
};


export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { doctor, date, notes, status } = req.body;

        if (doctor) {
            const isAdmin = await appointmentsDAO.isAdmin(doctor);
            if (!isAdmin) {
                return res.status(400).json({ message: 'El doctor especificado no es válido' });
            }
        }

          let updateData = { ...req.body };
            if (date) {
            const appointmentDate = new Date(date);
            if (isNaN(appointmentDate.getTime())) {
            return res.status(400).json({ message: 'Fecha inválida' });
      }
      updateData.date = appointmentDate;
    }
        const appointment = await appointmentsDAO.updateAppointment(id, updateData);
        if (!appointment) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        res.status(200).json(new AppointmentDTO(appointment));
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar turno', error: error.message });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await appointmentsDAO.deleteAppointment(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        res.status(200).json({ message: 'Turno eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar turno', error: error.message });
    }
};