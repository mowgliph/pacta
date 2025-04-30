import { z } from "zod";

export const CreateBackupSchema = z.object({
  description: z.string().max(200).optional(),
});

export const RestoreBackupSchema = z.object({
  backupId: z.string().uuid(),
});

export const DeleteBackupSchema = z.object({
  backupId: z.string().uuid(),
});
