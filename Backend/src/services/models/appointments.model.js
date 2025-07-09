//TURNERO\Backend\src\services\models\appointments.model.js
import mongoose from 'mongoose';

const collection = 'appointments';

const schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Paciente
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // Admin como doctor
    date: { type: Date, required: true }, // Fecha y hora del turno
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    notes: { type: String },
});

const appointmentsModel = mongoose.model(collection, schema);

export default appointmentsModel;