import { z } from "zod";

export const NotificationFilterSchema = z.object({
  userId: z.string().uuid(),
  isRead: z.boolean().optional(),
  type: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
});

export const NotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.string(),
  title: z.string().min(1),
  message: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
  data: z.record(z.any()).optional(),
  isRead: z.boolean().default(false),
  internalLink: z.string().optional(),
});
