/**
 * Repositorio para operaciones con Licencias usando Prisma
 */
import { BasePrismaRepository } from './BasePrismaRepository.js';

export class LicensePrismaRepository extends BasePrismaRepository {
  constructor() {
    super('license');
  }

  /**
   * Obtiene la licencia actual válida
   * @returns {Promise<Object|null>} - Licencia actual o null si no hay
   */
  async getCurrentLicense() {
    return this.prisma.license.findFirst({
      where: {
        active: true,
        expiryDate: {
          gte: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Activa una licencia específica
   * @param {String} licenseKey - Clave de licencia
   * @returns {Promise<Object>} - Licencia activada
   */
  async activateLicense(licenseKey) {
    return this.prisma.license.update({
      where: { licenseKey },
      data: { 
        active: true,
        activatedAt: new Date()
      }
    });
  }

  /**
   * Desactiva una licencia específica
   * @param {String} licenseKey - Clave de licencia
   * @returns {Promise<Object>} - Licencia desactivada
   */
  async deactivateLicense(licenseKey) {
    return this.prisma.license.update({
      where: { licenseKey },
      data: { 
        active: false,
        deactivatedAt: new Date()
      }
    });
  }

  /**
   * Verifica si una licencia permite acceso a una característica
   * @param {String} licenseKey - Clave de licencia
   * @param {String} feature - Característica a verificar
   * @returns {Promise<Boolean>} - true si tiene acceso
   */
  async hasFeatureAccess(licenseKey, feature) {
    const license = await this.prisma.license.findUnique({
      where: { licenseKey }
    });

    if (!license || !license.active || license.expiryDate < new Date()) {
      return false;
    }

    return license.features.includes(feature);
  }
}

// Crear y exportar instancia por defecto
const licensePrismaRepository = new LicensePrismaRepository();
export default licensePrismaRepository; 