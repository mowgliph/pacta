// Importo los tipos de contrato directamente desde los tipos compartidos
import type {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
  BankDetails,
  LegalRepresentative,
  Attachment,
} from "../../main/shared/types";

// Exportar tipos de contrato desde nuestro propio archivo
export * from "./contract";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "RA";
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplement {
  id: string;
  title: string;
  description: string;
  effectiveDate: Date;
  amount: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  createdById: string;
  approvedById?: string;
  contractId: string;
  createdBy?: User;
  approvedBy?: User;
  contract?: Contract;
  documents?: Document[];
}
