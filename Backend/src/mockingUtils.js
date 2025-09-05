import { fakerES as faker } from '@faker-js/faker'; // Importar faker para español
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import usersModel from './services/models/users.model.js';
import appointmentsModel from './services/models/appointments.model.js';
import config from './configs/configs.js';

// Verificar que URL_MONGO esté definida
if (!config.URL_MONGO) {
    console.error('Error: URL_MONGO no está definida en configs.js');
    process.exit(1); // Salir si no hay URL de conexión
}

// Conectar a MongoDB
mongoose.connect(config.URL_MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conectado a la base de datos para generar datos de prueba');
}).catch((err) => {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
});

// Función para generar una contraseña válida
function generarPasswordValida() {
    const letrasMayus = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letrasMinus = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const caracteresEspeciales = '!@#$%^&*()_+[]{}|;:,.<>?';

    let password = [
        faker.helpers.arrayElement(letrasMayus.split('')),
        faker.helpers.arrayElement(letrasMinus.split('')),
        faker.helpers.arrayElement(numeros.split('')),
        faker.helpers.arrayElement(caracteresEspeciales.split(''))
    ];

    const todosCaracteres = letrasMayus + letrasMinus + numeros + caracteresEspeciales;
    for (let i = password.length; i < 10; i++) {
        password.push(faker.helpers.arrayElement(todosCaracteres.split('')));
    }

    password = password.sort(() => Math.random() - 0.5);

    return password.join('');
}

// Función para generar usuarios falsos
async function generarUsuarios(cantidad = 10) {
    const usuarios = [];
    for (let i = 0; i < cantidad; i++) {
        const firstName = faker.person.firstName(); 
        const lastName = faker.person.lastName();
        const usuario = { 
            first_name: firstName,
            last_name: lastName,
            email: faker.internet.email({ firstName, lastName }),
            age: faker.number.int({ min: 18, max: 80 }), 
            phone: parseInt(faker.phone.number().replace(/\D/g, '')),
            password: await bcrypt.hash(generarPasswordValida(), 10),
            role: faker.helpers.arrayElement(['user', 'admin'])
        };
        usuarios.push(usuario); 
    }
    return usuarios;
}

// Función para generar turnos falsos
async function generarTurnos(cantidad, pacientes, doctores) {
    const turnos = [];
    for (let i = 0; i < cantidad; i++) {
        const paciente = faker.helpers.arrayElement(pacientes);
        const doctor = faker.helpers.arrayElement(doctores);
        const turno = {
            user: paciente._id,
            patient_name: `${paciente.first_name} ${paciente.last_name}`,
            doctor: doctor._id,
            date: faker.date.soon({ days: 30 }),
            status: faker.helpers.arrayElement(['pending', 'confirmed', 'cancelled']),
            notes: faker.lorem.sentence()
        };
        turnos.push(turno);
    }
    return turnos;
}

// Función principal para poblar la base de datos
async function poblarBaseDeDatos() {
    try {
        // Generar usuarios
        const usuariosFalsos = await generarUsuarios(15);
        const insertedUsuarios = await usersModel.insertMany(usuariosFalsos);
        console.log(`${insertedUsuarios.length} usuarios creados.`);

        // Separar pacientes y doctores
        const pacientes = insertedUsuarios.filter(u => u.role === 'user');
        const doctores = insertedUsuarios.filter(u => u.role === 'admin');

        // Verificar que haya pacientes y doctores
        if (pacientes.length === 0 || doctores.length === 0) {
            throw new Error('No se encontraron pacientes o doctores para generar turnos');
        }

        // Generar turnos
        const turnosFalsos = await generarTurnos(20, pacientes, doctores);
        const insertedTurnos = await appointmentsModel.insertMany(turnosFalsos);
        console.log(`${insertedTurnos.length} turnos creados.`);

        console.log('Base de datos poblada exitosamente.');
    } catch (error) {
        console.error('Error al poblar la base de datos:', error);
        process.exit(1);
    } finally {
        mongoose.connection.close();
    }
}

// Ejecutar el script
poblarBaseDeDatos();