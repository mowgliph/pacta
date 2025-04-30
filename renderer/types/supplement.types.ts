export enum SupplementStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum SupplementType {
  AMOUNT = "amount",
  DATE = "date",
  DESCRIPTION = "description",
  TITLE = "title",
  STATUS = "status",
  OTHER = "other",
}

export enum SupplementChangeType {
  EXTENSION = "extension",
  MODIFICATION = "modification",
  TERMINATION = "termination",
  PRICE_ADJUSTMENT = "price_adjustment",
  SCOPE_CHANGE = "scope_change",
  FORCE_MAJEURE = "force_majeure",
}

export interface SupplementUser {
  id: string;
  name: string;
  email?: string;
}

export interface SupplementDocument {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
}

export interface SupplementHistoryEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
  };
}

export interface Supplement {
  id: string;
  contractId: string;
  title: string;
  type: SupplementType;
  changeType: SupplementChangeType;
  previousValue: string;
  newValue: string;
  description: string;
  status: SupplementStatus;
  effectiveDate: string;
  documentUrl?: string;
  isApproved: boolean;
  createdBy: SupplementUser;
  approvedBy?: SupplementUser;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  documents?: SupplementDocument[];
  history?: SupplementHistoryEntry[];
  contract?: {
    id: string;
    contractNumber: string;
    description?: string;
  };
}

export interface CreateSupplementPayload {
  contractId: string;
  title: string;
  type: SupplementType;
  changeType: SupplementChangeType;
  previousValue: string;
  newValue: string;
  description: string;
  effectiveDate: string;
  documentUrl?: string;
}

export interface UpdateSupplementPayload {
  id: string;
  title?: string;
  type?: SupplementType;
  changeType?: SupplementChangeType;
  newValue?: string;
  description?: string;
  effectiveDate?: string;
  documentUrl?: string;
}

export interface ApproveSupplementPayload {
  supplementId: string;
  approvedById: string;
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
  GET_PENDING = "supplements:getPending",
  SEARCH = "supplements:search",
}
