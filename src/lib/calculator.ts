import type { CarOption, CarPromotion, FeeConfig } from "@/types";

export interface RollingFeeInput {
  price: number;
  registrationFee: number;
  fees: FeeConfig;
  selectedOptions: CarOption[];
  selectedPromotions: CarPromotion[];
}

export interface RollingFeeResult {
  price: number;
  registrationTax: number;
  registrationFee: number;
  insurance: number;
  fixedTotal: number;
  subtotal: number;
  optionsTotal: number;
  discountTotal: number;
  discountLines: { label: string; amount: number }[];
  optionLines: { label: string; amount: number }[];
  finalTotal: number;
}

/**
 * Công thức giữ nguyên logic bản gốc:
 *  - Trước bạ xe điện = 0% (miễn 100% theo NĐ 10/2022).
 *  - Bảo hiểm vật chất = 1.6% giá xe.
 *  - Phí đăng ký theo tỉnh (Đà Nẵng: 1.000.000đ).
 *  - Ưu đãi % tính trên (giá xe + tùy chọn thêm).
 */
export function calcRollingFee({
  price,
  registrationFee,
  fees,
  selectedOptions,
  selectedPromotions,
}: RollingFeeInput): RollingFeeResult {
  const registrationTax = (price * fees.registrationTaxRate) / 100;
  const insurance = (price * fees.insuranceRate) / 100;
  const fixedTotal = fees.fixed.reduce((sum, item) => sum + item.value, 0);

  const subtotal =
    price + registrationTax + registrationFee + insurance + fixedTotal;

  const optionLines = selectedOptions.map((option) => ({
    label: option.name,
    amount: option.price,
  }));
  const optionsTotal = optionLines.reduce((sum, line) => sum + line.amount, 0);

  const base = price + optionsTotal;
  const discountLines = selectedPromotions.map((promo) => {
    const amount = promo.fixed > 0 ? promo.fixed : (base * promo.percent) / 100;
    const suffix = promo.fixed > 0 ? "" : ` (-${promo.percent}%)`;
    return { label: `${promo.name}${suffix}`, amount };
  });
  const discountTotal = discountLines.reduce((sum, line) => sum + line.amount, 0);

  return {
    price,
    registrationTax,
    registrationFee,
    insurance,
    fixedTotal,
    subtotal,
    optionsTotal,
    discountTotal,
    discountLines,
    optionLines,
    finalTotal: Math.max(0, subtotal - discountTotal + optionsTotal),
  };
}

export type LoanType = "reducing" | "flat";

export interface LoanRow {
  period: number;
  opening: number;
  principal: number;
  interest: number;
  total: number;
}

export interface LoanResult {
  loanAmount: number;
  firstMonthPayment: number;
  totalInterest: number;
  totalPayment: number;
  rows: LoanRow[];
}

/** Dư nợ giảm dần (gốc đều) hoặc lãi chia đều — giống bản gốc. */
export function calcLoan(
  loanAmount: number,
  years: number,
  annualRate: number,
  type: LoanType,
): LoanResult {
  const months = Math.max(1, Math.round(years * 12));
  const rows: LoanRow[] = [];

  if (!loanAmount || loanAmount <= 0) {
    return {
      loanAmount: 0,
      firstMonthPayment: 0,
      totalInterest: 0,
      totalPayment: 0,
      rows,
    };
  }

  const principalPerMonth = loanAmount / months;
  let totalInterest = 0;

  if (type === "reducing") {
    const monthlyRate = annualRate / 100 / 12;
    let opening = loanAmount;
    for (let i = 0; i < months; i += 1) {
      const interest = opening * monthlyRate;
      totalInterest += interest;
      rows.push({
        period: i + 1,
        opening,
        principal: principalPerMonth,
        interest,
        total: principalPerMonth + interest,
      });
      opening -= principalPerMonth;
    }
    return {
      loanAmount,
      firstMonthPayment: principalPerMonth + loanAmount * monthlyRate,
      totalInterest,
      totalPayment: loanAmount + totalInterest,
      rows,
    };
  }

  const flatInterest = (annualRate * loanAmount) / 100 / 12;
  let opening = loanAmount;
  for (let i = 0; i < months; i += 1) {
    totalInterest += flatInterest;
    rows.push({
      period: i + 1,
      opening,
      principal: principalPerMonth,
      interest: flatInterest,
      total: principalPerMonth + flatInterest,
    });
    opening -= principalPerMonth;
  }

  return {
    loanAmount,
    firstMonthPayment: principalPerMonth + flatInterest,
    totalInterest,
    totalPayment: loanAmount + totalInterest,
    rows,
  };
}
