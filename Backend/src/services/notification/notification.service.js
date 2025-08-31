import appointmentsModel from '../models/appointments.model.js';
import usersModel from '../models/users.model.js';
import { sendAppointmentReminder } from '../../configs/nodemailer.config.js';
import {formatInTimeZone, toDate} from 'date-fns-tz';

const TIME_ZONE = 'America/Argentina/Buenos_Aires';

export const checkPendingAppointments = async () => {
  try {

    const now = new Date();
    const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const notificationCooldown = new Date(now.getTime() - 24 * 60 * 60 * 1000 ); // 24 horas en milisegundos

    console.log('Verificando turnos pendientes:', now.toISOString()); // Depuración
    // Buscar turnos pendientes
    const pendingAppointments = await appointmentsModel
      .find({ 
        status: 'pending', 
        date: {
          $gte: now,
          $lte: twelveHoursLater,
        },
        $or: [
          { lastNotified: { $exists: false } }, // No se ha enviado notificación
          { lastNotified: { $lte: notificationCooldown } } // Última notificación fue hace más de 24 horas
        ]
      })
      .populate('user') // Obtener los datos del usuario asociado
      .lean();

    for (const appointment of pendingAppointments) {
      const user = appointment.user;
      if (user && user.email) {

        const localDate = formatInTimeZone(toDate(appointment.date), TIME_ZONE, 'yyyy-MM-dd HH:mm');
        console.log(`Turno encontrado: ${appointment._id}, Fecha UTC: ${appointment.date}, Fecha local: ${localDate}`);

        // Enviar notificación al usuario
        await sendAppointmentReminder(user.email, {
          date: localDate,
          notes: appointment.notes,
        });

        await appointmentsModel.updateOne(
          { _id: appointment._id },
          { $set: { lastNotified: new Date() } } // Actualizar la fecha de la última notificación
        )
      }
    }
    console.log('Notificaciones de turnos pendientes enviadas con éxito');
  } catch (error) {
    console.error('Error al verificar turnos pendientes:', error);
  }
};