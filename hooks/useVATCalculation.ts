import { useMemo } from 'react';

/**
 * VAT Rate options available in the system
 */
export const VAT_RATES = {
  HIGH: 21, // Standard VAT rate in Netherlands
  LOW: 9, // Reduced VAT rate
  ZERO: 0, // Zero VAT
} as const;

export type VATRateType = 'standard' | 'reduced' | 'zero' | 'custom';

interface VATCalculationResult {
  subtotal: number;
  vatAmount: number;
  total: number;
  effectiveVATRate: number;
}

/**
 * useVATCalculation hook - Calculates VAT for given amount and rate
 * Centralizes VAT calculation logic to prevent duplication
 *
 * @param amount - The base amount (excl. VAT)
 * @param vatRateType - Type of VAT rate to apply
 * @param customRate - Custom VAT percentage (only used when vatRateType is 'custom')
 * @returns Object with subtotal, vatAmount, total, and effectiveVATRate
 *
 * @example
 * const { subtotal, vatAmount, total } = useVATCalculation(100, 'standard');
 * // subtotal: 100, vatAmount: 21, total: 121
 *
 * const result = useVATCalculation(100, 'custom', 15);
 * // subtotal: 100, vatAmount: 15, total: 115
 */
export const useVATCalculation = (
  amount: number,
  vatRateType: VATRateType = 'standard',
  customRate: number = 0
): VATCalculationResult => {
  return useMemo(() => {
    let effectiveRate: number;

    switch (vatRateType) {
      case 'standard':
        effectiveRate = VAT_RATES.HIGH;
        break;
      case 'reduced':
        effectiveRate = VAT_RATES.LOW;
        break;
      case 'zero':
        effectiveRate = VAT_RATES.ZERO;
        break;
      case 'custom':
        effectiveRate = customRate;
        break;
      default:
        effectiveRate = VAT_RATES.HIGH;
    }

    const subtotal = amount;
    const vatAmount = (amount * effectiveRate) / 100;
    const total = subtotal + vatAmount;

    return {
      subtotal,
      vatAmount,
      total,
      effectiveVATRate: effectiveRate,
    };
  }, [amount, vatRateType, customRate]);
};

/**
 * Helper function to calculate VAT from total (incl. VAT)
 * Useful when you have the total price and need to extract the VAT amount
 *
 * @param totalInclVAT - Total amount including VAT
 * @param vatRate - VAT percentage
 * @returns Object with exclusive amount, VAT amount, and inclusive amount
 *
 * @example
 * const result = calculateVATFromTotal(121, 21);
 * // { exclusive: 100, vat: 21, inclusive: 121 }
 */
export const calculateVATFromTotal = (
  totalInclVAT: number,
  vatRate: number
) => {
  const exclusive = totalInclVAT / (1 + vatRate / 100);
  const vat = totalInclVAT - exclusive;

  return {
    exclusive: parseFloat(exclusive.toFixed(2)),
    vat: parseFloat(vat.toFixed(2)),
    inclusive: totalInclVAT,
  };
};

/**
 * Format currency for display
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'EUR')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'EUR'
): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(amount);
};
