import { z } from "zod";

export const OpenFileSchema = z.object({
  filters: z
    .array(
      z.object({
        name: z.string(),
        extensions: z.array(z.string()),
      })
    )
    .optional(),
  properties: z.array(z.string()).optional(),
  defaultPath: z.string().optional(),
});

export const ConfirmDialogSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: z.enum(["info", "error", "question", "warning", "none"]).optional(),
});
