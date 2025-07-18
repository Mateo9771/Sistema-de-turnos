import __dirname from "../utils/dirname.js"
import swaggerJsdoc from 'swagger-jsdoc';

//swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Citas Médicas API',
      description: 'API documentación para la aplicación de citas médicas',
    },
  },
  apis:[`${__dirname}/../docs/**/*.yaml`],
}

export const swaggerSpecs = swaggerJsdoc(swaggerOptions);