
export interface SimulationParams {
  propertyValue: number;
  downPaymentPercent: number;
  months: number;
  annualInterestRate: number;
  // Custo bancário aproximado (a.a.) informado pelo próprio usuário — seguros, tarifas
  // e demais encargos que, somados aos juros, compõem o "CET aproximado" exibido no
  // relatório. Nunca é o CET oficial: é só uma referência que o usuário digita.
  bankCostPercent?: number;
}

export interface AmortizationResult {
  initialInstallment: number;
  finalInstallment: number;
  totalInterest: number;
  totalAmountPaid: number;
  requiredIncome: number;
  schedule: Array<{
    month: number;
    installment: number;
    interest: number;
    amortization: number;
    balance: number;
  }>;
}

export interface ComparisonResult {
  sac: AmortizationResult;
  price: AmortizationResult;
}

export enum CalculationSystem {
  SAC = 'SAC',
  PRICE = 'PRICE',
}

// Novos tipos para Comissão
export type CommissionCalculationMode = 'percentage_of_total' | 'percentage_of_value';

export interface CommissionParams {
  propertyValue: number;
  totalCommissionPercent: number; // Ex: 6% pago pelo vendedor
  agentSharePercent: number;      // Ex: 40% (da comissão) ou 2% (do imóvel)
  calculationMode: CommissionCalculationMode;
}

export interface CommissionResult {
  totalCommissionValue: number;   // Valor cheio (ex: 6% do imóvel)
  agentCommissionValue: number;   // Parte do corretor
  brokerCommissionValue: number;  // Parte da imobiliária (Restante)
}

// Novos tipos para Precificação
export type PricingMode = 'calculate_listing_price' | 'calculate_net_value';

export interface PricingParams {
  inputValue: number; // Pode ser "Valor Líquido Desejado" ou "Valor do Anúncio" dependendo do modo
  commissionPercent: number;
  negotiationMarginPercent: number;
  mode: PricingMode;
}

export interface PricingResult {
  listingPrice: number;       // Valor do Anúncio (Vitrine)
  salePriceEstimated: number; // Valor de Fechamento (Após negociação)
  commissionValue: number;    // Valor da Comissão
  marginValue: number;        // Valor da Margem (Gordura)
  netValue: number;           // Valor na mão do proprietário
}

// Novos tipos para Custos de Compra
export interface PurchaseCostParams {
  propertyValue: number;
  downPaymentPercent: number; // Entrada para compor o custo inicial
  itbiPercent: number;     // Max 3%
  registryPercent: number; // Max 2%
}

export interface PurchaseCostResult {
  downPaymentValue: number;
  itbiValue: number;
  registryValue: number;
  totalCostValue: number; // Soma de Entrada + ITBI + Cartório
}

// Tipos de Usuário e Plano (Basic removido)
export type UserPlan = 'free' | 'plus';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  plan: UserPlan;
  cpf?: string;
  phone?: string;
  creciNumber?: string;
  creciState?: string;
  usageCount: number;
  lastResetDate?: string;
  subscriptionEndDate?: string; // Data ISO do fim da assinatura
  billingCycle?: 'monthly' | 'annual';
  trialStartedAt?: string; // Data ISO em que o trial legado foi ativado
  createdAt?: string; // Data ISO de criação do perfil
}
