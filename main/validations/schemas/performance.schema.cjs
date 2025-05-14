const { z } = require("zod");

exports.PerformanceSchema = z.object({
  metricName: z.string().min(1),
  value: z.number(),
  timestamp: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});
