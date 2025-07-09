//TURNERO\Backend\src\services\dto\appointments.dto.js
export class AppointmentDTO {
    constructor(appointment) {
        this.id = appointment._id.toString();
        this.user = {
            id: appointment.user?._id?.toString(),
            first_name: appointment.user?.first_name,
            last_name: appointment.user?.last_name,
            email: appointment.user?.email
        };
        this.doctor = {
            id: appointment.doctor?._id?.toString(),
            first_name: appointment.doctor?.first_name,
            last_name: appointment.doctor?.last_name,
            email: appointment.doctor?.email
        };
        this.date = appointment.date.toISOString();
        this.status = appointment.status;
        this.notes = appointment.notes || '';
    }

    static fromRequest(data) {
        return {
            user: data.user,
            doctor: data.doctor,
            date: new Date(data.date),
            notes: data.notes || '',
            status: data.status || 'pending'
        };
    }
}