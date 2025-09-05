//TURNERO\Backend\src\controllers\appointments.controller.js
import mongoose from 'mongoose';
import appointmentsDAO from '../services/dao/appointments.dao.js';
import { AppointmentDTO } from '../services/dto/appointments.dto.js';
import logger from '../utils/logger.js';

export const createAppointment = async (req, res) => {
    try {
        logger.info('Creando un nuevo turno');
        logger.info(`Datos recibidos: ${JSON.stringify(req.body)}`);
        
        if (!req.user || !req.user.id) {
            logger.warn('Usuario no autenticado al intentar crear un turno');
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const { doctor, date, notes, patient_name } = req.body;

        if (!doctor || !date) {
            return res.status(400).json({ message: 'Faltan datos requeridos' });
        }
         // Validar ObjectId
        if (!mongoose.Types.ObjectId.isValid(doctor)) {
            logger.warn(`ID de doctor inválido: ${doctor}`);
            return res.status(400).json({ message: 'ID de doctor inválido' });
        }

         // Validar fecha
         const appointmentDate = new Date(date);
        if (!date || isNaN(appointmentDate.getTime())) {
        return res.status(400).json({ message: 'Fecha inválida' });
        }

        // Validar que el doctor sea un admin
         const isAdminDoctor = await appointmentsDAO.isAdmin(doctor);
         logger.info(`El doctor con ID ${doctor} es admin: ${isAdminDoctor}`);
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
            finalPatientName = patient_name || null;
        } else {
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
        logger.error(`Error al crear turno: ${error.message}\n${error.stack}`);
        res.status(500).json({ message: 'Error al crear el turno', error: error.message });
    }
};

export const getUserAppointment = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }
        const appointments = await appointmentsDAO.findAppointmentsByUser(req.user.id);
        logger.info(`Turnos encontrados para el usuario ${req.user.id}: ${appointments.length}`);
        res.status(200).json(appointments.map(app => new AppointmentDTO(app)));
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener turnos', error: error.message });
    }
};

export const getAllAppointments = async (req, res) => {
    try {
        if (!req.user) {
            logger.warn("Usuario no autenticado en la solicitud a /appointments");
            return res.status(401).json({ status: "error", message: "Usuario no autenticado" });
        }
        if (req.user.role !== "admin") {
            logger.warn(`Acceso denegado para usuario con rol ${req.user.role}`);
            return res.status(403).json({ status: "error", message: "Acceso denegado" });
        }

        const { page = 1, limit = 10, startDate, endDate, searchQuery, noPagination } = req.query;
        let query = {};

        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                return res.status(400).json({ status: "error", message: "Fecha de inicio inválida" });
            }
            query.date = { $gte: start };
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (isNaN(end.getTime())) {
                return res.status(400).json({ status: "error", message: "Fecha de fin inválida" });
            }
            query.date = { ...query.date, $lte: end };
        }
        if (searchQuery) {
            query.$or = [
                { patient_name: { $regex: searchQuery, $options: "i" } },
                { notes: { $regex: searchQuery, $options: "i" } },
                { "doctor.first_name": { $regex: searchQuery, $options: "i" } },
                { "doctor.last_name": { $regex: searchQuery, $options: "i" } },
            ];
        }

        const { appointments, total } = await appointmentsDAO.findAllAppointments(
            query,
            noPagination ? undefined : parseInt(page),
            noPagination ? undefined : parseInt(limit)
        );

        res.status(200).json({
            appointments: appointments.map((app) => new AppointmentDTO(app)),
            total,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (error) {
        logger.error(`Error al obtener turnos: ${error.message}\n${error.stack}`);
        res.status(500).json({ status: "error", message: "Error al obtener turnos", error: error.message });
    }
};

export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { doctor, date, notes, status } = req.body;

        if (doctor) {
            const isAdmin = await appointmentsDAO.isAdmin(doctor);
            if (!isAdmin) {
                logger.warn(`Intento de actualizar turno con doctor inválido: ${doctor}`);
                return res.status(400).json({ message: 'El doctor especificado no es válido' });
            }
        }

          let updateData = { ...req.body };
            if (date) {
            const appointmentDate = new Date(date);
            if (isNaN(appointmentDate.getTime())) {
            logger.warn(`Fecha inválida proporcionada para actualización: ${date}`);
            return res.status(400).json({ message: 'Fecha inválida' });
      }
      updateData.date = appointmentDate;
    }
        const appointment = await appointmentsDAO.updateAppointment(id, updateData);
        if (!appointment) {
            logger.warn(`Intento de actualizar turno inexistente con ID: ${id}`);
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        logger.info(`Turno con ID ${id} actualizado exitosamente`);
        res.status(200).json(new AppointmentDTO(appointment));
    } catch (error) {
        logger.error(`Error al actualizar turno: ${error.message}\n${error.stack}`);
        res.status(500).json({ message: 'Error al actualizar turno', error: error.message });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await appointmentsDAO.deleteAppointment(id);
        if (!appointment) {
            logger.warn(`Intento de eliminar turno inexistente con ID: ${id}`);
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        logger.info(`Turno con ID ${id} eliminado exitosamente`);
        res.status(200).json({ message: 'Turno eliminado' });
    } catch (error) {
        logger.error(`Error al eliminar turno: ${error.message}\n${error.stack}`);
        res.status(500).json({ message: 'Error al eliminar turno', error: error.message });
    }
};