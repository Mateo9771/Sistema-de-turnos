//TURNERO\Backend\src\services\dao\appointments.dao.js
import appointmentsModel from "../models/appointments.model.js";
import usersModel from "../models/users.model.js";

class AppointmentsDAO {
    async createAppointment(appointmentData) {
        const appointment = new appointmentsModel(appointmentData);
        return await appointment.save();    
    }

    async findAppointmentsByUser(userId) {
        return await appointmentsModel.find({ user: userId }).populate('user doctor');
    }

    async findAllAppointments() {
        return await appointmentsModel.find().populate('user doctor');
    }

     async findAppointmentByDoctorAndDate(doctorId, date) {
    // Asegurar que la fecha sea un objeto Date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      throw new Error('Fecha inválida');
    }
    return await appointmentsModel.findOne({ doctor: doctorId, date: appointmentDate });
  }

    async updateAppointment(id, updateData) {
        return await appointmentsModel.findByIdAndUpdate(id, updateData, { new: true }).populate('user doctor');
    }

    async deleteAppointment(id){
        return await appointmentsModel.findByIdAndDelete(id)
    }

    async isAdmin(userId) {
        try {
        const user = await usersModel.findById(userId);
        return user && user.role === 'admin';
    } catch (error) {
        console.error('Error al verificar si el usuario es admin:', error);
        throw new Error('Error al verificar el rol del doctor');
    }
    }
}

export default new AppointmentsDAO();