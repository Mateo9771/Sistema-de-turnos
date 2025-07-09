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
        return await appointmentsModel.findOne({ doctor: doctorId, date });
    }

    async updateAppointment(id, updateData) {
        return await appointmentsModel.findByIdAndUpdate(id, updateData, { new: true }).populate('user doctor');
    }

    async deleteAppointment(id){
        return await appointmentsModel.findByIdAndDelete(id)
    }

    async isAdmin(userId) {
        const user = await usersModel.findById(userId);
        return user && user.role === 'admin';
    }
}

export default new AppointmentsDAO();