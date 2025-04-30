export enum SupplementStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum SupplementType {
  AMOUNT = "amount",
  DATE = "date",
  DESCRIPTION = "description",
  OTHER = "other",
}

export interface Supplement {
  id: string;
  contractId: string;
  type: SupplementType;
  previousValue: string;
  newValue: string;
  description: string;
  status: SupplementStatus;
  createdBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplementPayload {
  contractId: string;
  type: SupplementType;
  previousValue: string;
  newValue: string;
  description: string;
}

export interface UpdateSupplementPayload {
  type?: SupplementType;
  newValue?: string;
  description?: string;
  status?: SupplementStatus;
}

export enum SupplementChannels {
  GET_ALL = "supplements:getAll",
  GET_BY_ID = "supplements:getById",
  GET_BY_CONTRACT = "supplements:getByContract",
  CREATE = "supplements:create",
  UPDATE = "supplements:update",
  DELETE = "supplements:delete",
  APPROVE = "supplements:approve",
  REJECT = "supplements:reject",
}
