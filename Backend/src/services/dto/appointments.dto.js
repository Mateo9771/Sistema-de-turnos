//TURNERO\Backend\src\services\dto\appointments.dto.js
export class AppointmentDTO {
    constructor(appointment) {
        this.id = appointment._id.toString();
        this.user = appointment.user ? appointment.user._id : null;
        this.patient_name = appointment.patient_name || null;
        this.doctor = {
            id: appointment.doctor?._id?.toString(),
            first_name: appointment.doctor?.first_name,
            last_name: appointment.doctor?.last_name,
            email: appointment.doctor?.email
        };
        this.date = appointment.date ? appointment.date.toISOString() : null;
        this.status = appointment.status;
        this.notes = appointment.notes || '';
    }

    static fromRequest(data) {
        return {
            user: data.user || null,
            patient_name: data.patient_name || null,
            doctor: data.doctor,
            date: data.date ? new Date(data.date) : null, // Convertir a Date
            notes: data.notes || '',
            status: data.status || 'pending'
        };
    }
}