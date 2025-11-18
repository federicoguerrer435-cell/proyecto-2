const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api';

async function testPasswordReset() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: 'admin@creditos.com'
      }
    });
    console.log(`Iniciando prueba de reseteo para el usuario: ${user.email}`);

    await axios.post(`${API_URL}/auth/forgot-password`, { email: user.email });
    console.log('Solicitud de reseteo enviada exitosamente.');

    const updatedUser = await prisma.user.findFirst({
        where: {
            id: user.id
        }
    });

    console.log('Token obtenido de la base de datos.');

    const resetToken = updatedUser.resetPasswordToken;

    console.log('Token de reseteo obtenido de la respuesta.');

    const newPassword = 'newPassword123';
    await axios.post(`${API_URL}/auth/reset-password/${resetToken}`, { password: newPassword });

    console.log('Contraseña reseteada exitosamente.');

  } catch (error) {
    console.error('Error en la prueba de reseteo de contraseña:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPasswordReset();
