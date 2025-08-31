//TURNERO\Backend\src\services\models\appointments.model.js
import mongoose from 'mongoose';

const collection = 'appointments';

const schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Paciente
    patient_name: { type: String, required: false, default: null }, // Nombre del paciente
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Admin como doctor
    date: { type: Date, required: true }, // Fecha y hora del turno
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    notes: { type: String },
    lastNotified: { type: Date }, // Fecha de la última notificación enviada
});

const appointmentsModel = mongoose.model(collection, schema);

export default appointmentsModel;