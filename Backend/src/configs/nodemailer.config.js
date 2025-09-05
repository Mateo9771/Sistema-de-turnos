//TURNERO\Backend\src\configs\nodemailer.config.js
import nodemailer from 'nodemailer';
import config from './configs.js';
import logger from '../utils/logger.js';

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS, 
  },
});

// Verificación de la configuración del transporte
transporter.verify((error, success) => {
    if (error) {
        logger.error(`Error al verificar la configuración de Nodemailer: ${error.message}`);
    } else {
        logger.info('Configuración de Nodemailer verificada exitosamente');
    }
});

// Función para enviar correo de recordatorio de turno
export const sendAppointmentReminder = async (userEmail, appointmentDetails) => {
  const mailOptions = {
    from: config.EMAIL_USER,
    to: userEmail,
    subject: 'Recordatorio de turno pendiente',
    text: `Estimado/a paciente, tiene un turno pendiente.\n\nDetalles:\nFecha: ${appointmentDetails.date}\nNotas: ${appointmentDetails.notes || 'Sin notas'}\n\nPor favor, confirme o cancele su turno.`,
    html: `
      <h3>Recordatorio de turno pendiente</h3>
      <p>Estimado/a paciente,</p>
      <p>Tiene un turno pendiente con los siguientes detalles:</p>
      <ul>
        <li><strong>Fecha:</strong> ${appointmentDetails.date}</li>
        <li><strong>Notas:</strong> ${appointmentDetails.notes || 'Sin notas'}</li>
      </ul>
      <p>Por favor, confirme o cancele su turno.</p>
    `,
  };

  try {
      logger.info(`Enviando recordatorio de turno a: ${userEmail}, Fecha: ${appointmentDetails.date}`);
      await transporter.sendMail(mailOptions);
      logger.info(`Correo enviado exitosamente a: ${userEmail}`);
  } catch (error) {
      logger.error(`Error al enviar correo a ${userEmail}: ${error.message}`);
      throw new Error(`Error al enviar correo: ${error.message}`);
  }
};

export default transporter;