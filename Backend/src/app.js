//Backend/src/app.js
import express from 'express';
import mongoose from 'mongoose';
import config from './configs/configs.js'
import cors from 'cors'
import morgan from 'morgan';
import cookieParser from 'cookie-parser'
import initializePassport from './configs/passport.config.js';
import passport from 'passport';
import sessionsRouter from './routes/sessions.router.js';
import appointmentsRouter from './routes/appointments.router.js';
import resetPasswordRouter from './routes/resetPassword.router.js';
import usersRouter from './routes/users.router.js';
import swaggerUiExpress from 'swagger-ui-express';
import { swaggerSpecs } from './configs/swagger.js';
import cron from 'node-cron';
import {checkPendingAppointments} from './services/notification/notification.service.js';
import logger from './utils/logger.js';

//set servidor
const app = express();
const PORT = config.PORT;
const URL_MONGO = config.URL_MONGO;

// Middleware para deshabilitar el cacheo
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
};

//cors y json
app.use(cors({
  origin: config.FRONTEND_URL, // URL donde corre React
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true // si usás cookies o auth con sesión
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser('CoderS3cr3tC0d3'));
app.use(noCache);

initializePassport();
app.use(passport.initialize());

//router
app.use('/api/sessions', sessionsRouter); 
app.use('/api/appointments', appointmentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/reset-password', resetPasswordRouter);
app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerSpecs));

//conexión servidor
const server = app.listen(PORT, () => {
    logger.info(`Servidor escuchando en el puerto ${PORT}`);
})

mongoose
    .connect(URL_MONGO)
    .then(() => logger.info('Conectado a la base de datos'))
    .catch((error) => logger.error('Error al conectar a la base de datos:', error));


// Programar tarea para notificaciones
cron.schedule('*/30 * * * *', () => {
  logger.info('Verificando turnos pendientes...');
  checkPendingAppointments();
});

