const { z } = require("zod");

exports.CreateBackupSchema = z.object({
  description: z.string().max(200).optional(),
});

exports.RestoreBackupSchema = z.object({
  backupId: z.string().uuid(),
});

exports.DeleteBackupSchema = z.object({
  backupId: z.string().uuid(),
});
