export interface Contract {
  id: string;
  name: string;
  type: 'cliente' | 'proveedor';
  description?: string;
  status: 'Active' | 'Expired' | 'Pending' | 'Terminated';
  startDate: Date;
  endDate: Date;
  documentUrl?: string;
  documentFile?: File;
  supplements?: Supplement[];
  userId: string;
  companyId?: string;
  departmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServerContract {
  id: number;
  name: string;
  companyName?: string;
  status: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  documents?: Array<{
    id: number;
    name: string;
    filePath?: string;
    fileUrl?: string;
  }>;
  supplements?: Array<{
    id: number;
    title?: string;
    description: string;
    amount: number;
    date: Date;
    filePath?: string;
    fileUrl?: string;
  }>;
}

export interface ContractData {
  id: string;
  name: string;
  client: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  documents?: Document[];
  supplements?: Supplement[];
}

export interface Document {
  id: string;
  name: string;
  filePath: string;
}

export interface Supplement {
  id: string;
  contractId: string;
  description: string;
  fileUrl?: string;
  documentFile?: File;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractFilters {
  status?: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}

export type ContractFormData = Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'supplements'>;

export interface ContractTableRow {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  actions?: React.ReactNode;
}

export interface ContractActivity {
  id: string;
  contractId: string;
  userId: string;
  action: string;
  details: string;
  createdAt: Date;
}