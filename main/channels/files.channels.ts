export enum FilesChannels {
  // Operaciones básicas de archivos
  SAVE_FILE = "files:save",
  READ_FILE = "files:read",
  DELETE_FILE = "files:delete",
  LIST_FILES = "files:list",

  // Operaciones específicas para documentos
  SAVE_DOCUMENT = "files:saveDocument",
  GET_DOCUMENT = "files:getDocument",
  DELETE_DOCUMENT = "files:deleteDocument",
  LIST_DOCUMENTS = "files:listDocuments",

  // Operaciones de respaldo
  CREATE_BACKUP = "files:createBackup",
  RESTORE_BACKUP = "files:restoreBackup",
  LIST_BACKUPS = "files:listBackups",

  // Operaciones de validación
  VALIDATE_FILE = "files:validate",
  CHECK_FILE_EXISTS = "files:exists",

  // Operaciones de compresión
  COMPRESS_FILE = "files:compress",
  DECOMPRESS_FILE = "files:decompress",
}

export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface DocumentMetadata extends FileMetadata {
  contractId?: string;
  supplementId?: string;
  category: string;
  description?: string;
}

export interface BackupMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  createdAt: Date;
  status: "completed" | "failed" | "in_progress";
  error?: string;
}
