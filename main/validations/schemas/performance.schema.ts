import { z } from "zod";

export const PerformanceSchema = z.object({
  metricName: z.string().min(1),
  value: z.number(),
  timestamp: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});
