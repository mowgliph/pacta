export type ContractStatus =
  | "Vigente"
  | "Próximo a Vencer"
  | "Vencido"
  | "Archivado";

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  description: string;
  parties: string;
  signDate: Date;
  signPlace: string;
  type: string;
  companyName: string;
  companyAddress: string;
  nationality: string;
  commercialAuth: string;
  bankDetails: {
    account: string;
    branch: string;
    agency: string;
    holder: string;
    currency: "CUP" | "MLC";
  };
  reeupCode: string;
  nit: string;
  contactPhones: string[];
  legalRepresentative: {
    name: string;
    position: string;
    documentType: string;
    documentNumber: string;
    documentDate: Date;
  };
  providerObligations: string[];
  clientObligations: string[];
  deliveryPlace: string;
  deliveryTerm: string;
  acceptanceProcedure: string;
  value: number;
  currency: "MN" | "MLC";
  paymentMethod: string;
  paymentTerm: string;
  warrantyTerm: string;
  warrantyScope: string;
  technicalStandards?: string;
  claimProcedure: string;
  disputeResolution: string;
  latePaymentInterest: string;
  breachPenalties: string;
  notificationMethods: string[];
  minimumNoticeTime: string;
  startDate: Date;
  endDate: Date;
  extensionTerms: string;
  earlyTerminationNotice: string;
  forceMajeure: string;
  attachments: {
    type: string;
    description: string;
    documentUrl?: string;
  }[];
  status: ContractStatus;
  isRestricted: boolean;
  createdById: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ContractFilters {
  status?: ContractStatus | "Todos";
  type?: string;
  search?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ContractStats {
  total: number;
  byStatus: {
    [key in ContractStatus]: number;
  };
}
