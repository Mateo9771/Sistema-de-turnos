//TURNERO\Backend\src\services\dao\appointments.dao.js
import appointmentsModel from "../models/appointments.model.js";
import usersModel from "../models/users.model.js";
import logger from '../../utils/logger.js';
import mongoose from "mongoose";

class AppointmentsDAO {
    // Crear un nuevo turno
    async createAppointment(appointmentData) {
        const appointment = new appointmentsModel(appointmentData);
        logger.info(`Creando turno: ${JSON.stringify(appointmentData)}`);
        return await appointment.save();    
    }
   async findAppointmentsByUser(userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            logger.error(`ID de usuario inválido: ${userId}`);
            throw new Error("ID de usuario inválido");
        }
        logger.info(`Buscando turnos para el usuario: ${userId}`);
        return appointmentsModel
            .find({ user: userId })
            .populate({
                path: "user doctor",
                select: "first_name last_name email",
                options: { lean: true },
            })
            .sort({ date: 1 })
            .lean();
    }
    // Buscar todos los turnos con opción de filtro
     async findAllAppointments(query = {}, page, limit) {
        try {
            let appointments;
            let total;
            // Si no se proporcionan page y limit, devolver todos los resultados sin paginación
            if (page === undefined || limit === undefined) {
                appointments = await appointmentsModel
                    .find(query)
                    .populate({
                        path: "user doctor",
                        select: "first_name last_name email",
                        options: { lean: true },
                    })
                    .sort({ date: 1 })
                    .lean();
                total = await appointmentsModel.countDocuments(query);
            } else {
                const skip = (page - 1) * limit;
                appointments = await appointmentsModel
                    .find(query)
                    .populate({
                        path: "user doctor",
                        select: "first_name last_name email",
                        options: { lean: true },
                    })
                    .sort({ date: 1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();
                total = await appointmentsModel.countDocuments(query);
            }

            logger.info(`Total de turnos encontrados: ${appointments.length}, Total general: ${total}`);
            return { appointments, total };
        } catch (error) {
            logger.error(`Error en findAllAppointments: ${error.message}\n${error.stack}`);
            throw error;
        }
    }
    // Buscar turno por ID de doctor y fecha
    async findAppointmentByDoctorAndDate(doctorId, date) {
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            logger.error(`ID de doctor inválido: ${doctorId}`);
            throw new Error('ID de doctor inválido');
        }
        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
            logger.error(`Fecha inválida: ${date}`);
            throw new Error('Fecha inválida');
        }
        logger.info(`Buscando turno para doctor ${doctorId} en fecha ${date}`);
        return appointmentsModel.findOne({ doctor: doctorId, date: appointmentDate });
    }
    // Actualizar turno por ID
    async updateAppointment(id, updateData) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.error(`ID de turno inválido: ${id}`);
            throw new Error('ID de turno inválido');
        }
        logger.info(`Actualizando turno ${id} con datos: ${JSON.stringify(updateData)}`);
        return appointmentsModel.findByIdAndUpdate(id, updateData, { new: true })
            .populate('user doctor');
    }
    // Eliminar turno por ID
    async deleteAppointment(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.error(`ID de turno inválido: ${id}`);
            throw new Error('ID de turno inválido');
        }
        logger.info(`Eliminando turno: ${id}`);
        return appointmentsModel.findByIdAndDelete(id);
    }

     async isAdmin(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                logger.error(`ID de usuario inválido: ${userId}`);
                throw new Error('ID de usuario inválido');
            }
            const user = await usersModel.findById(userId);
            if (!user) {
                logger.warn(`Usuario no encontrado: ${userId}`);
                throw new Error('Usuario no encontrado');
            }
            logger.info(`Verificando rol de usuario ${userId}: ${user.role}`);
            return user.role === 'admin';
        } catch (error) {
            logger.error(`Error al verificar si el usuario es admin: ${error.message}`);
            throw new Error('Error al verificar el rol del doctor');
        }
    }
}

export default new AppointmentsDAO();