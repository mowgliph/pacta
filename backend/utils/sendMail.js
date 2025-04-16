const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

/**
 * Envía un correo electrónico utilizando la configuración SMTP almacenada en la base de datos.
 * @param {object} mailOptions - Opciones del correo.
 * @param {string} mailOptions.to - Dirección de correo del destinatario.
 * @param {string} mailOptions.subject - Asunto del correo.
 * @param {string} [mailOptions.text] - Cuerpo del correo en texto plano.
 * @param {string} [mailOptions.html] - Cuerpo del correo en HTML.
 * @returns {Promise<object>} - Promesa que resuelve con la información del envío.
 * @throws {Error} - Si no hay configuración SMTP habilitada o si ocurre un error al enviar.
 */
async function sendMail({ to, subject, text, html }) {
  let logEntry = {
    to,
    subject,
    body: text || html || '',
    status: 'failed', // Default status
    errorMessage: null,
  };

  try {
    const config = await prisma.sMTPConfig.findFirst({
      where: { enabled: true },
    });

    if (!config) {
      throw new Error('La configuración SMTP no está habilitada o no existe.');
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
      // Opcional: Añadir configuración TLS si es necesario
      // tls: {
      //   ciphers:'SSLv3'
      // }
    });

    // Verificar conexión antes de enviar (opcional pero recomendado)
    await transporter.verify();

    const mailInfo = await transporter.sendMail({
      from: `"Pacta App" <${config.from}>`, // Usar el 'from' configurado
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    logEntry.status = 'sent';
    console.log('Correo enviado: %s', mailInfo.messageId);
    // Guardar log de éxito
    await prisma.emailLog.create({ data: logEntry });
    return mailInfo;

  } catch (error) {
    console.error('Error al enviar correo:', error);
    logEntry.errorMessage = error.message;
    // Guardar log de error
    try {
        await prisma.emailLog.create({ data: logEntry });
    } catch (logError) {
        console.error('Error al guardar log de correo fallido:', logError);
    }
    // Re-lanzar el error para que el llamador sepa que falló
    throw error;
  }
}

module.exports = sendMail;
