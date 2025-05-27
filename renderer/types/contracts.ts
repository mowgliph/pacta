export interface ArchivedContract {
  id: string;
  number: string;
  contractNumber: string;
  company: string;
  companyName?: string;
  type: 'Cliente' | 'Proveedor';
  description: string;
  startDate: string;
  endDate: string;
  updatedAt: string;
  status: string;
  amount?: number;
  attachment?: string | null;
}
