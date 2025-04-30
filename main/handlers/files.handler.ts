import { ipcMain } from "electron";
import { FilesService } from "../services/files.service";
import { FilesChannels } from "../channels/files.channels";

export class FilesHandler {
  private filesService: FilesService;

  constructor() {
    this.filesService = FilesService.getInstance();
    this.registerHandlers();
  }

  private registerHandlers(): void {
    // Operaciones básicas de archivos
    ipcMain.handle(
      FilesChannels.SAVE_FILE,
      async (_, buffer: Buffer, metadata: any) => {
        return this.filesService.saveFile(buffer, metadata);
      }
    );

    ipcMain.handle(FilesChannels.READ_FILE, async (_, filePath: string) => {
      return this.filesService.readFile(filePath);
    });

    ipcMain.handle(FilesChannels.DELETE_FILE, async (_, filePath: string) => {
      return this.filesService.deleteFile(filePath);
    });

    ipcMain.handle(FilesChannels.LIST_FILES, async (_, directory: string) => {
      return this.filesService.listFiles(directory);
    });

    // Operaciones de respaldo
    ipcMain.handle(FilesChannels.CREATE_BACKUP, async () => {
      return this.filesService.createBackup();
    });

    ipcMain.handle(
      FilesChannels.RESTORE_BACKUP,
      async (_, backupPath: string) => {
        return this.filesService.restoreBackup(backupPath);
      }
    );

    ipcMain.handle(FilesChannels.LIST_BACKUPS, async () => {
      return this.filesService.listBackups();
    });

    // Operaciones de validación
    ipcMain.handle(FilesChannels.VALIDATE_FILE, async (_, filePath: string) => {
      return this.filesService.validateFile(filePath);
    });

    ipcMain.handle(
      FilesChannels.CHECK_FILE_EXISTS,
      async (_, filePath: string) => {
        return this.filesService.validateFile(filePath);
      }
    );
  }
}
