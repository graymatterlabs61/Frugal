export interface Invoice {
  id: string;
  date: number;
  description: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
}

export interface PaymentMethodInfo {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface UsageData {
  connections: number;
  projects: number;
  limits: {
    connections: number;
    projects: number;
  };
  plan: string;
}
