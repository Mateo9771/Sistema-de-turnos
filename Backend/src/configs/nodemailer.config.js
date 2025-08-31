//TURNERO\Backend\src\configs\nodemailer.config.js
import nodemailer from 'nodemailer';
import config from './configs.js';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes usar otro servicio como Outlook, SendGrid, etc.
  auth: {
    user: config.EMAIL_USER, // Correo desde el que enviarás los emails
    pass: config.EMAIL_PASS, // Contraseña o App Password si usas Gmail con 2FA
  },
});

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
    await transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${userEmail}`);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};

export default transporter;