const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

exports.EmailService = class EmailService {
  transporter = null;
  prisma;
  logger;

  constructor(prisma, logger) {
    this.prisma = prisma;
    this.logger = logger;
    this.initializeTransporter();
  }

  /**
   * Inicializa el transporter de nodemailer con la configuración de la BD
   */
  async initializeTransporter() {
    try {
      // Intentar obtener configuración de la base de datos
      const correoConfig = await this.prisma.emailConfig.findFirst({
        where: { enabled: true },
      });

      if (correoConfig) {
        this.transporter = nodemailer.createTransport({
          host: correoConfig.host,
          port: correoConfig.port,
          secure: correoConfig.secure,
          auth: {
            user: correoConfig.username,
            pass: correoConfig.password,
          },
        });
        this.logger?.info(
          "Transporte de email configurado desde base de datos"
        );
      } else {
        // Fallback a variables de entorno si no hay config en BD
        if (process.env.SMTP_HOST) {
          this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number.parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          });
          this.logger?.info(
            "Transporte de email configurado desde variables de entorno"
          );
        } else {
          this.logger?.warn(
            "No se encontró configuración de email. La funcionalidad de envío estará desactivada."
          );
        }
      }
    } catch (error) {
      this.logger?.error("Error inicializando transporter de email:", error);
    }
  }

  /**
   * Enviar un email general
   */
  async sendEmail(options) {
    try {
      // Si no hay transporter, no enviar email pero registrarlo
      if (!this.transporter) {
        await this.logEmailAttempt(
          options.to,
          options.subject,
          options.html || "",
          "failed",
          "Email service not configured"
        );
        return false;
      }

      // Procesar plantilla si se proporcionó
      let html = options.html;
      if (options.template) {
        html = await this.renderTemplate(
          options.template,
          options.context || {}
        );
      }

      // Obtener remitente desde configuración
      const correoConfig = await this.prisma.emailConfig.findFirst({
        where: { enabled: true },
      });
      const from =
        correoConfig?.from ||
        process.env.SMTP_FROM ||
        "PACTA <noreply@pacta.com>";

      // Enviar email
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html,
        attachments: options.attachments,
      });

      this.logger?.info("Email enviado correctamente", {
        messageId: info.messageId,
      });

      // Registrar email en BD
      await this.logEmailAttempt(
        options.to,
        options.subject,
        html || "",
        "sent"
      );

      return true;
    } catch (error) {
      this.logger?.error("Error al enviar email:", error);

      // Registrar error
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      await this.logEmailAttempt(
        options.to,
        options.subject,
        options.html || "",
        "failed",
        errorMessage
      );

      return false;
    }
  }

  /**
   * Enviar email utilizando una plantilla de la base de datos
   */
  async sendTemplatedEmailFromDB(templateName, to, data) {
    try {
      // Buscar plantilla en la BD
      const template = await this.prisma.emailTemplate.findUnique({
        where: { name: templateName },
      });

      if (!template) {
        throw new Error(`Plantilla de email "${templateName}" no encontrada`);
      }

      // Reemplazar placeholders en asunto y cuerpo
      let subject = template.subject;
      let body = template.body;

      for (const [key, value] of Object.entries(data)) {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, "g"), String(value));
        body = body.replace(new RegExp(placeholder, "g"), String(value));
      }

      // Enviar email
      return await this.sendEmail({
        to,
        subject,
        html: body,
      });
    } catch (error) {
      this.logger?.error(
        `Error al enviar email con plantilla "${templateName}":`,
        error
      );
      return false;
    }
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(user) {
    return await this.sendEmail({
      to: user.email,
      subject: "Bienvenido a PACTA",
      template: "welcome",
      context: {
        name: user.name,
        loginUrl: `${process.env.APP_URL || "http://localhost:3000"}/login`,
      },
    });
  }

  /**
   * Enviar email de restablecimiento de contraseña
   */
  async sendPasswordResetEmail(user, resetToken) {
    return await this.sendEmail({
      to: user.email,
      subject: "Restablecimiento de contraseña - PACTA",
      template: "password-reset",
      context: {
        name: user.name,
        resetUrl: `${
          process.env.APP_URL || "http://localhost:3000"
        }/reset-password?token=${resetToken}`,
        expiryTime: "1 hora",
      },
    });
  }

  /**
   * Enviar notificación de contrato próximo a vencer
   */
  async sendContractExpirationEmail(user, contract) {
    const daysRemaining = Math.ceil(
      (contract.endDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return await this.sendEmail({
      to: user.email,
      subject: "Contrato próximo a vencer - PACTA",
      template: "contract-expiration",
      context: {
        name: user.name,
        contractTitle: contract.title,
        daysRemaining,
        contractUrl: `${
          process.env.APP_URL || "http://localhost:3000"
        }/contracts/${contract.id}`,
      },
    });
  }

  /**
   * Renderiza una plantilla desde un archivo
   */
  async renderTemplate(templateName, context) {
    const templatePath = path.join(
      __dirname,
      "templates",
      `${templateName}.hbs`
    );
    const templateContent = await fs.promises.readFile(templatePath, "utf-8");
    const compiledTemplate = Handlebars.compile(templateContent);
    return compiledTemplate(context);
  }

  /**
   * Registrar intento de envío de email en la base de datos
   */
  async logEmailAttempt(to, subject, body, status, errorMessage) {
    await this.prisma.emailLog.create({
      data: {
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        body,
        status,
        errorMessage,
      },
    });
  }
};
