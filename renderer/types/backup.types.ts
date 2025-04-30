export interface Backup {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  createdAt: Date;
  note: string | null;
  isAutomatic: boolean;
  createdById: string;
  emailNotification: boolean;
  createdBy: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface BackupResponse {
  success: boolean;
  data?: Backup[];
  error?: string;
}
