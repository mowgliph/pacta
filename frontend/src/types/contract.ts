export interface Contract {
  id: number;
  title: string;
  contractNumber: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
  notificationDays: number;
  amount: number;
  currency: string;
  documentPath?: string;
  createdBy: number;
  lastModifiedBy?: number;
}