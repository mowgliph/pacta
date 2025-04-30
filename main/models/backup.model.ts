export interface Backup {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  createdById: string;
  createdAt: Date;
  note: string | null;
  emailNotification: boolean;
  isAutomatic: boolean;
  createdBy: {
    id: string;
    name: string;
  };
  restores?: BackupRestore[];
}

export interface BackupRestore {
  id: string;
  backupId: string;
  restoredById: string;
  restoredAt: Date;
  backup?: Backup;
  restoredBy?: {
    id: string;
    name: string;
  };
}
