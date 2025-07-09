//TURNERO\Backend\src\routes\appointments.router.js
import { Router } from "express";
import { createAppointment, getUserAppointment, getAllAppointments, updateAppointment, deleteAppointment } from "../controllers/appointments.controller.js";
import { authorization, passportCall } from "../middlewares/auth.js";
import usersModel from "../services/models/users.model.js";

const router = Router();

router.post('/', passportCall('jwt'), createAppointment)

router.get('/user', passportCall('jwt'), getUserAppointment)

router.get('/', passportCall('jwt'), authorization ('admin'), getAllAppointments)

router.put('/:id', passportCall('jwt'), updateAppointment)

router.delete('/:id', passportCall('jwt'), deleteAppointment)

router.get('/doctors', passportCall('jwt'), async (req, res) => {
    try {
      const doctors = await usersModel.find({ role: 'admin' }).select('first_name last_name email _id');
      res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener doctores', error: error.message });
    }
  });

export default router;