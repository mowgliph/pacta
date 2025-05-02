import { prisma } from "./prisma";

interface CreateHistoryRecordParams {
  entityType: string;
  entityId: string;
  userId: string;
  action: string;
  details: string;
  changes?: string;
  description?: string;
  contractId?: string;
  supplementId?: string;
}

export async function createHistoryRecord(params: CreateHistoryRecordParams) {
  return prisma.historyRecord.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      action: params.action,
      details: params.details,
      changes: params.changes,
      description: params.description,
      contractId: params.contractId,
      supplementId: params.supplementId,
    },
  });
}
