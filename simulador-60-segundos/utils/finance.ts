import { AmortizationResult, SimulationParams, CommissionParams, CommissionResult, PricingParams, PricingResult, PurchaseCostParams, PurchaseCostResult } from '../types';

export const calculateSimulation = (params: SimulationParams): { sac: AmortizationResult, price: AmortizationResult } => {
  const { propertyValue, downPaymentPercent, months, annualInterestRate } = params;

  // Guard clause for zero or invalid property value
  if (!propertyValue || propertyValue <= 0) {
    const emptyResult: AmortizationResult = {
      initialInstallment: 0,
      finalInstallment: 0,
      totalInterest: 0,
      totalAmountPaid: 0,
      requiredIncome: 0,
      schedule: []
    };
    return { sac: emptyResult, price: emptyResult };
  }

  const downPayment = propertyValue * (downPaymentPercent / 100);
  const loanAmount = propertyValue - downPayment;

  // Calculate monthly interest rate from annual nominal rate
  const monthlyInterestRate = Math.pow(1 + (annualInterestRate / 100), 1 / 12) - 1;

  return {
    sac: calculateSAC(loanAmount, monthlyInterestRate, months),
    price: calculatePRICE(loanAmount, monthlyInterestRate, months),
  };
};

const calculateSAC = (principal: number, monthlyRate: number, months: number): AmortizationResult => {
  let currentBalance = principal;
  const constantAmortization = principal / months;
  let totalInterest = 0;
  let totalAmountPaid = 0;
  const schedule = [];

  for (let i = 1; i <= months; i++) {
    const interest = currentBalance * monthlyRate;
    const installment = constantAmortization + interest;

    totalInterest += interest;
    totalAmountPaid += installment;
    currentBalance -= constantAmortization;

    // Prevent negative float precision errors
    if (currentBalance < 0.01) currentBalance = 0;

    schedule.push({
      month: i,
      installment,
      interest,
      amortization: constantAmortization,
      balance: currentBalance
    });
  }

  const initialInstallment = schedule[0]?.installment || 0;
  // Standard rule: Installment cannot exceed 30% of income
  const requiredIncome = initialInstallment / 0.30;

  return {
    initialInstallment,
    finalInstallment: schedule[months - 1]?.installment || 0,
    totalInterest,
    totalAmountPaid,
    requiredIncome,
    schedule
  };
};

const calculatePRICE = (principal: number, monthlyRate: number, months: number): AmortizationResult => {
  // Guard clause to prevent division by zero in PMT formula if rate is 0 (unlikely but possible)
  if (monthlyRate === 0) {
    // Linear simple division if no interest
    const val = principal / months;
    return {
      initialInstallment: val,
      finalInstallment: val,
      totalInterest: 0,
      totalAmountPaid: principal,
      requiredIncome: val / 0.30,
      schedule: []
    };
  }

  // PMT Formula: P * [ i(1+i)^n ] / [ (1+i)^n – 1 ]
  const compoundInterestFactor = Math.pow(1 + monthlyRate, months);
  const fixedInstallment = principal * ((monthlyRate * compoundInterestFactor) / (compoundInterestFactor - 1));

  let currentBalance = principal;
  let totalInterest = 0;
  let totalAmountPaid = 0;
  const schedule = [];

  for (let i = 1; i <= months; i++) {
    const interest = currentBalance * monthlyRate;
    const amortization = fixedInstallment - interest;

    currentBalance -= amortization;
    totalInterest += interest;
    totalAmountPaid += fixedInstallment;

    if (currentBalance < 0.01) currentBalance = 0;

    schedule.push({
      month: i,
      installment: fixedInstallment,
      interest,
      amortization,
      balance: currentBalance
    });
  }

  const initialInstallment = schedule[0]?.installment || 0;
  // Standard rule: Installment cannot exceed 30% of income
  const requiredIncome = initialInstallment / 0.30;

  return {
    initialInstallment,
    finalInstallment: schedule[months - 1]?.installment || 0,
    totalInterest,
    totalAmountPaid,
    requiredIncome,
    schedule
  };
};

export const calculateCommission = (params: CommissionParams): CommissionResult => {
  const { propertyValue, totalCommissionPercent, agentSharePercent, calculationMode } = params;

  // Valor total pago pelo vendedor (Ex: 6% de 500k = 30k)
  const totalCommissionValue = propertyValue * (totalCommissionPercent / 100);

  let agentCommissionValue = 0;

  if (calculationMode === 'percentage_of_total') {
    // Modo 1: Recebo X% sobre o valor da comissão total
    // Ex: 50% de 30k = 15k
    agentCommissionValue = totalCommissionValue * (agentSharePercent / 100);
  } else {
    // Modo 2: Recebo X% sobre o valor do imóvel
    // Ex: 2% de 500k = 10k
    agentCommissionValue = propertyValue * (agentSharePercent / 100);
  }

  const brokerCommissionValue = totalCommissionValue - agentCommissionValue;

  return {
    totalCommissionValue,
    agentCommissionValue,
    brokerCommissionValue: Math.max(0, brokerCommissionValue) // Evita negativo se a lógica do usuário for atípica
  };
};

export const calculatePricing = (params: PricingParams): PricingResult => {
  const { inputValue, commissionPercent, negotiationMarginPercent, mode } = params;

  // Normalizar percentuais (ex: 6 vira 0.06)
  const commRate = (commissionPercent || 0) / 100;
  const marginRate = (negotiationMarginPercent || 0) / 100;

  let listingPrice = 0;

  if (mode === 'calculate_listing_price') {
    // Abordagem Aditiva: Líquido = Anúncio * (1 - Margem% - Comissão%)
    // Logo: Anúncio = Líquido / (1 - Margem% - Comissão%)
    const denominator = 1 - marginRate - commRate;
    listingPrice = denominator > 0 ? inputValue / denominator : 0;
  } else {
    // Input é o valor do ANÚNCIO (Listing)
    listingPrice = inputValue;
  }

  // Ambos incidem sobre o preço de anúncio para transparência e verificação simples
  const marginValue = listingPrice * marginRate;
  const commissionValue = listingPrice * commRate;
  const salePriceEstimated = listingPrice - marginValue;
  const netValue = listingPrice - marginValue - commissionValue;

  // Retirar casas decimais (arredondamento)
  return {
    listingPrice: Math.round(listingPrice),
    salePriceEstimated: Math.round(salePriceEstimated),
    commissionValue: Math.round(commissionValue),
    marginValue: Math.round(marginValue),
    netValue: Math.round(netValue)
  };
};

export const calculatePurchaseCosts = (params: PurchaseCostParams): PurchaseCostResult => {
  const { propertyValue, downPaymentPercent, itbiPercent, registryPercent } = params;

  // Garantir limites
  const safeItbi = Math.min(3, Math.max(0, itbiPercent));
  const safeRegistry = Math.min(2, Math.max(0, registryPercent));

  const downPaymentValue = propertyValue * (downPaymentPercent / 100);
  const itbiValue = propertyValue * (safeItbi / 100);
  const registryValue = propertyValue * (safeRegistry / 100);

  return {
    downPaymentValue,
    itbiValue,
    registryValue,
    totalCostValue: downPaymentValue + itbiValue + registryValue
  };
};

export const formatCurrency = (value: number, decimals: number = 2) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};