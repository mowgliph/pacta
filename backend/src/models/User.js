import prisma from '../database/prisma.js';
import { compareSync, hashSync } from 'bcrypt';

export class User {
  // Métodos de instancia
  async comparePassword(password) {
    return compareSync(password, this.password);
  }

  // Método para serializar el usuario (usado al generar tokens)
  toJSON() {
    const values = { ...this };
    delete values.password; // Eliminar contraseña de la salida
    return values;
  }

  // Métodos estáticos
  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async create(data) {
    const hashedPassword = hashSync(data.password, 10);
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  static async update(id, data) {
    if (data.password) {
      data.password = hashSync(data.password, 10);
    }
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export default User;
