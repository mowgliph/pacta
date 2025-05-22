const { IPC_CHANNELS } = require('../channels/ipc-channels.cjs');
const { validateLicense } = require('./license-handler.cjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function registerLicenseHandlers() {
  ipcMain.handle(IPC_CHANNELS.LICENSE.VALIDATE, async (_, licenseData) => {
    return await validateLicense(licenseData);
  });

  ipcMain.handle(IPC_CHANNELS.LICENSE.STATUS, async () => {
    const license = await prisma.license.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });
    return license ? {
      valid: true,
      type: license.licenseType,
      expiryDate: license.expiryDate
    } : { valid: false };
  });

  ipcMain.handle(IPC_CHANNELS.LICENSE.REVOKE, async (_, licenseNumber) => {
    const license = await prisma.license.update({
      where: { licenseNumber },
      data: { isActive: false }
    });
    return license;
  });

  ipcMain.handle(IPC_CHANNELS.LICENSE.LIST, async () => {
    return await prisma.license.findMany({
      orderBy: { updatedAt: 'desc' }
    });
  });

  ipcMain.handle(IPC_CHANNELS.LICENSE.INFO, async (_, licenseNumber) => {
    return await prisma.license.findUnique({
      where: { licenseNumber }
    });
  });
}

module.exports = {
  registerLicenseHandlers
};
