const { prisma } = require("./prisma.cjs");

exports.createHistoryRecord = async function (params) {
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
};
