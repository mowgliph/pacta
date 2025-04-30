import { app } from "electron";
import path from "path";
import fs from "fs/promises";
import {
  FileMetadata,
  DocumentMetadata,
  BackupMetadata,
} from "../channels/files.channels";
import { createHash } from "crypto";
import { promisify } from "util";
import { exec } from "child_process";
import { mkdir } from "fs/promises";

const execAsync = promisify(exec);

export class FilesService {
  private static instance: FilesService;
  private readonly basePath: string;
  private readonly documentsPath: string;
  private readonly backupsPath: string;
  private readonly tempPath: string;

  private constructor() {
    this.basePath = path.join(app.getPath("userData"), "files");
    this.documentsPath = path.join(this.basePath, "documents");
    this.backupsPath = path.join(this.basePath, "backups");
    this.tempPath = path.join(this.basePath, "temp");

    // Asegurar que los directorios existan
    this.ensureDirectories();
  }

  public static getInstance(): FilesService {
    if (!FilesService.instance) {
      FilesService.instance = new FilesService();
    }
    return FilesService.instance;
  }

  private async ensureDirectories(): Promise<void> {
    await mkdir(this.basePath, { recursive: true });
    await mkdir(this.documentsPath, { recursive: true });
    await mkdir(this.backupsPath, { recursive: true });
    await mkdir(this.tempPath, { recursive: true });
  }

  private generateFileId(): string {
    return createHash("sha256")
      .update(Date.now().toString() + Math.random().toString())
      .digest("hex");
  }

  public async validateFile(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  public async saveFile(
    buffer: Buffer,
    metadata: Partial<FileMetadata>
  ): Promise<FileMetadata> {
    const fileId = this.generateFileId();
    const fileName = `${fileId}_${metadata.name}`;
    const filePath = path.join(this.documentsPath, fileName);

    await fs.writeFile(filePath, buffer);

    const stats = await fs.stat(filePath);
    const fileMetadata: FileMetadata = {
      id: fileId,
      name: metadata.name || fileName,
      path: filePath,
      size: stats.size,
      type: metadata.type || "application/octet-stream",
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: metadata.userId || "system",
    };

    return fileMetadata;
  }

  public async readFile(filePath: string): Promise<Buffer> {
    if (!(await this.validateFile(filePath))) {
      throw new Error("File not found");
    }
    return fs.readFile(filePath);
  }

  public async deleteFile(filePath: string): Promise<void> {
    if (!(await this.validateFile(filePath))) {
      throw new Error("File not found");
    }
    await fs.unlink(filePath);
  }

  public async listFiles(directory: string): Promise<FileMetadata[]> {
    const files = await fs.readdir(directory);
    const metadataPromises = files.map(async (file) => {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      return {
        id: this.generateFileId(),
        name: file,
        path: filePath,
        size: stats.size,
        type: "application/octet-stream",
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
        userId: "system",
      };
    });

    return Promise.all(metadataPromises);
  }

  public async createBackup(): Promise<BackupMetadata> {
    const backupId = this.generateFileId();
    const backupName = `backup_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.zip`;
    const backupPath = path.join(this.backupsPath, backupName);

    try {
      // Comprimir la carpeta de documentos
      await execAsync(`zip -r "${backupPath}" "${this.documentsPath}"`);

      const stats = await fs.stat(backupPath);

      return {
        id: backupId,
        name: backupName,
        path: backupPath,
        size: stats.size,
        createdAt: new Date(),
        status: "completed",
      };
    } catch (error) {
      return {
        id: backupId,
        name: backupName,
        path: backupPath,
        size: 0,
        createdAt: new Date(),
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  public async restoreBackup(backupPath: string): Promise<void> {
    if (!(await this.validateFile(backupPath))) {
      throw new Error("Backup file not found");
    }

    // Limpiar el directorio de documentos actual
    await fs.rm(this.documentsPath, { recursive: true, force: true });
    await mkdir(this.documentsPath, { recursive: true });

    // Extraer el backup
    await execAsync(`unzip "${backupPath}" -d "${this.documentsPath}"`);
  }

  public async listBackups(): Promise<BackupMetadata[]> {
    const files = await fs.readdir(this.backupsPath);
    const metadataPromises = files.map(async (file) => {
      const filePath = path.join(this.backupsPath, file);
      const stats = await fs.stat(filePath);
      return {
        id: this.generateFileId(),
        name: file,
        path: filePath,
        size: stats.size,
        createdAt: stats.birthtime,
        status: "completed" as const,
      };
    });

    return Promise.all(metadataPromises);
  }
}
