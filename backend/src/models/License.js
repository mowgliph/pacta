import { prisma } from '../database/prisma.js';
import { differenceInDays } from 'date-fns';

class License {
  // Métodos estáticos
  static async findById(id) {
    return prisma.license.findUnique({
      where: { id },
    });
  }

  static async findOne(where) {
    return prisma.license.findFirst({
      where,
    });
  }

  static async findAll(options = {}) {
    return prisma.license.findMany(options);
  }

  static async findOrCreate({ where, defaults }) {
    const existing = await prisma.license.findFirst({
      where,
    });

    if (existing) {
      return [existing, false];
    }

    const created = await prisma.license.create({
      data: defaults,
    });

    return [created, true];
  }

  static async getCurrentLicense() {
    return prisma.license.findFirst({
      where: {
        active: true,
        expiryDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        expiryDate: 'desc',
      },
    });
  }

  static async generateLicenseKey() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LICENSE-${timestamp}-${random}`;
  }

  // Métodos de instancia (simulados para compatibilidad con el código existente)
  isValid() {
    return this.active && new Date(this.expiryDate) > new Date();
  }

  isExpiringSoon(days = 30) {
    if (!this.isValid()) return false;
    return differenceInDays(new Date(this.expiryDate), new Date()) <= days;
  }

  canActivate() {
    // Comprobar si la licencia puede ser activada
    if (this.active === false) return false;
    if (new Date(this.expiryDate) < new Date()) return false;
    return true;
  }

  async activate(activationData) {
    return prisma.license.update({
      where: { id: this.id },
      data: {
        active: true,
        metadata: {
          ...this.metadata,
          activationDate: new Date().toISOString(),
          ...activationData
        }
      }
    });
  }

  // Método para actualizar la licencia
  async update(data) {
    return prisma.license.update({
      where: { id: this.id },
      data
    });
  }

  async save() {
    return prisma.license.update({
      where: { id: this.id },
      data: this
    });
  }
}

export default License; 