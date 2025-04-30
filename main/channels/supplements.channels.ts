import { z } from "zod";

/**
 * Enum con los canales de comunicación IPC para suplementos
 */
export enum SupplementsChannels {
  GET_ALL = "supplements:getAll",
  GET_BY_ID = "supplements:getById",
  GET_BY_CONTRACT = "supplements:getByContract",
  CREATE = "supplements:create",
  UPDATE = "supplements:update",
  DELETE = "supplements:delete",
  APPROVE = "supplements:approve",
}

/**
 * Esquema de validación para la creación de suplementos
 */
export const CreateSupplementSchema = z.object({
  contractId: z.string().uuid(),
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  changes: z.string().min(10),
  effectiveDate: z.date(),
  documentUrl: z.string().optional(),
});

/**
 * Esquema de validación para la actualización de suplementos
 */
export const UpdateSupplementSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  changes: z.string().min(10).optional(),
  effectiveDate: z.date().optional(),
  documentUrl: z.string().optional(),
});

/**
 * Esquema de validación para la aprobación de suplementos
 */
export const ApproveSupplementSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Esquema de validación para obtener suplementos por contrato
 */
export const GetSupplementsByContractSchema = z.object({
  contractId: z.string().uuid(),
});

/**
 * Esquema de validación para obtener un suplemento por ID
 */
export const GetSupplementByIdSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Esquema de validación para eliminar un suplemento
 */
export const DeleteSupplementSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Tipos de solicitud para suplementos
 */
export interface SupplementsRequests {
  [SupplementsChannels.GET_ALL]: void;
  [SupplementsChannels.GET_BY_ID]: z.infer<typeof GetSupplementByIdSchema>;
  [SupplementsChannels.GET_BY_CONTRACT]: z.infer<
    typeof GetSupplementsByContractSchema
  >;
  [SupplementsChannels.CREATE]: z.infer<typeof CreateSupplementSchema>;
  [SupplementsChannels.UPDATE]: z.infer<typeof UpdateSupplementSchema>;
  [SupplementsChannels.DELETE]: z.infer<typeof DeleteSupplementSchema>;
  [SupplementsChannels.APPROVE]: z.infer<typeof ApproveSupplementSchema>;
}
