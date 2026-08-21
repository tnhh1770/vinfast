"use client";

import { useMemo, useState } from "react";
import { Calculator, ChevronDown, Gift, Phone, Settings2 } from "lucide-react";

import { calcLoan, calcRollingFee, type LoanType } from "@/lib/calculator";
import { formatNumber, formatVnd } from "@/lib/format";
import { PHONE_HREF, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Car, FeeConfig } from "@/types";

interface RollingFeeCalculatorProps {
  cars: Car[];
  /** Khi đặt trên trang chi tiết xe: khoá sẵn 1 mẫu xe. */
  lockedCarSlug?: string;
  fees: FeeConfig;
  showCarPicker?: boolean;
  className?: string;
}

export function RollingFeeCalculator({
  cars,
  lockedCarSlug,
  fees,
  showCarPicker = true,
  className,
}: RollingFeeCalculatorProps) {
  const [carSlug, setCarSlug] = useState(lockedCarSlug ?? "");
  const [versionIndex, setVersionIndex] = useState<number>(lockedCarSlug ? 0 : -1);
  const [locationIndex, setLocationIndex] = useState(0);
  const [optionIdx, setOptionIdx] = useState<number[]>([]);
  const [promoIdx, setPromoIdx] = useState<number[]>([]);

  const [loanRatio, setLoanRatio] = useState(70);
  const [years, setYears] = useState(fees.loan.defaultYears);
  const [rate, setRate] = useState(fees.loan.defaultRate);
  const [loanType, setLoanType] = useState<LoanType>("reducing");
  const [showSchedule, setShowSchedule] = useState(false);

  const car = useMemo(
    () => cars.find((item) => item.slug === carSlug) ?? null,
    [cars, carSlug],
  );

  const version = car && versionIndex >= 0 ? car.versions[versionIndex] : null;
  const location = fees.locations[locationIndex];

  const result = useMemo(() => {
    if (!car || !version) return null;
    return calcRollingFee({
      price: version.price,
      registrationFee: location.registrationFee,
      fees,
      selectedOptions: optionIdx.map((i) => car.options[i]).filter(Boolean),
      selectedPromotions: promoIdx.map((i) => car.promotions[i]).filter(Boolean),
    });
  }, [car, version, location, fees, optionIdx, promoIdx]);

  const loan = useMemo(() => {
    if (!result) return null;
    return calcLoan((result.finalTotal * loanRatio) / 100, years, rate, loanType);
  }, [result, loanRatio, years, rate, loanType]);

  const resetSelections = () => {
    setOptionIdx([]);
    setPromoIdx([]);
  };

  const toggle = (
    list: number[],
    setList: (next: number[]) => void,
    index: number,
  ) => {
    setList(
      list.includes(index) ? list.filter((i) => i !== index) : [...list, index],
    );
  };

  const selectClass =
    "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-medium text-ink outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15";

  return (
    <div className={cn("grid gap-5 lg:grid-cols-2", className)}>
      {/* ------------------------------ Phí lăn bánh ----------------------- */}
      <section
        aria-labelledby="tinh-phi-lan-banh"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <h3
          id="tinh-phi-lan-banh"
          className="flex items-center gap-2 text-base font-bold uppercase tracking-wide text-ink"
        >
          <Calculator className="size-4 text-brand" aria-hidden />
          Tính phí lăn bánh
        </h3>

        <div className="mt-5 space-y-3.5">
          {showCarPicker ? (
            <div>
              <label htmlFor="calc-car" className="mb-1.5 block text-[13px] font-semibold text-ink">
                Mẫu xe
              </label>
              <select
                id="calc-car"
                className={selectClass}
                value={carSlug}
                onChange={(event) => {
                  setCarSlug(event.target.value);
                  setVersionIndex(-1);
                  resetSelections();
                }}
              >
                <option value="">Chọn mẫu xe</option>
                {cars.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="calc-version" className="mb-1.5 block text-[13px] font-semibold text-ink">
                Phiên bản
              </label>
              <select
                id="calc-version"
                className={selectClass}
                value={versionIndex}
                disabled={!car}
                onChange={(event) => setVersionIndex(Number(event.target.value))}
              >
                <option value={-1}>Chọn phiên bản</option>
                {car?.versions.map((item, index) => (
                  <option key={item.name} value={index}>
                    {item.name} — {formatNumber(item.price)}₫
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="calc-location" className="mb-1.5 block text-[13px] font-semibold text-ink">
                Nơi đăng ký
              </label>
              <select
                id="calc-location"
                className={selectClass}
                value={locationIndex}
                onChange={(event) => setLocationIndex(Number(event.target.value))}
              >
                {fees.locations.map((item, index) => (
                  <option key={item.name} value={index}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tùy chọn thêm */}
          <fieldset className="relative rounded-xl border-[1.5px] border-brand/70 px-3.5 pb-3.5 pt-5">
            <legend className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <Settings2 className="size-3" aria-hidden />
              Tùy chọn thêm
            </legend>
            {car?.options.length ? (
              <div className="flex flex-wrap gap-2">
                {car.options.map((option, index) => (
                  <label
                    key={option.name}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition",
                      optionIdx.includes(index)
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border bg-background text-ink hover:border-brand/40",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--brand)]"
                      checked={optionIdx.includes(index)}
                      onChange={() => toggle(optionIdx, setOptionIdx, index)}
                    />
                    {option.name}
                    <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[11px] font-bold text-brand">
                      {option.badge}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-ink-soft">
                {car ? "Mẫu xe này không có tùy chọn thêm." : "Chọn mẫu xe để xem các tùy chọn thêm."}
              </p>
            )}
          </fieldset>

          {/* Ưu đãi */}
          <fieldset className="relative rounded-xl border-[1.5px] border-accent-orange/70 px-3.5 pb-3.5 pt-5">
            <legend className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-accent-orange px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <Gift className="size-3" aria-hidden />
              Ưu đãi
            </legend>
            {car?.promotions.length ? (
              <div className="grid gap-2">
                {car.promotions.map((promo, index) => (
                  <label
                    key={promo.name}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition",
                      promoIdx.includes(index)
                        ? "border-accent-orange bg-accent-orange/10 text-accent-orange"
                        : "border-border bg-background text-ink hover:border-accent-orange/40",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--accent-orange)]"
                      checked={promoIdx.includes(index)}
                      onChange={() => toggle(promoIdx, setPromoIdx, index)}
                    />
                    <span className="flex-1">{promo.name}</span>
                    <span className="rounded-full bg-accent-orange/15 px-2 py-0.5 text-[11px] font-bold text-accent-orange">
                      {promo.badge}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-ink-soft">
                {car ? "Chưa có chương trình ưu đãi cho mẫu xe này." : "Chọn mẫu xe để xem các chương trình ưu đãi."}
              </p>
            )}
          </fieldset>
        </div>

        {/* Bảng kết quả */}
        <div className="mt-5 overflow-hidden rounded-xl border border-border">
          {!result ? (
            <p className="bg-muted/50 px-4 py-6 text-center text-sm text-ink-soft">
              Vui lòng chọn dòng xe và nơi đăng ký để dự toán chi phí.
            </p>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">
                Bảng dự toán chi phí lăn bánh {car?.name} {version?.name}
              </caption>
              <tbody className="divide-y divide-border">
                <Row label="Giá xe niêm yết" value={formatVnd(result.price, "VNĐ")} />
                {result.optionLines.map((line) => (
                  <Row
                    key={line.label}
                    label={`⚙️ ${line.label}`}
                    value={`+${formatVnd(line.amount, "VNĐ")}`}
                    valueClass="text-brand"
                  />
                ))}
                {result.discountLines.map((line) => (
                  <Row
                    key={line.label}
                    label={`🎁 ${line.label}`}
                    value={`-${formatVnd(line.amount, "VNĐ")}`}
                    valueClass="text-accent-red"
                  />
                ))}
                <Row label="Phí trước bạ" value={formatVnd(result.registrationTax, "VNĐ")} />
                <Row label="Phí đăng ký" value={formatVnd(result.registrationFee, "VNĐ")} />
                <Row
                  label={`Bảo hiểm vật chất (${fees.insuranceRate}%)`}
                  value={formatVnd(result.insurance, "VNĐ")}
                />
                {fees.fixed.map((item) => (
                  <Row key={item.label} label={item.label} value={formatVnd(item.value, "VNĐ")} />
                ))}
              </tbody>
              <tfoot className="divide-y divide-border bg-muted/40 font-semibold">
                <Row label="Tổng dự toán" value={formatVnd(result.subtotal, "VNĐ")} />
                {result.discountTotal > 0 ? (
                  <Row
                    label="Tổng ưu đãi"
                    value={`-${formatVnd(result.discountTotal, "VNĐ")}`}
                    valueClass="text-accent-red"
                  />
                ) : null}
                {result.optionsTotal > 0 ? (
                  <Row
                    label="Tùy chọn thêm"
                    value={`+${formatVnd(result.optionsTotal, "VNĐ")}`}
                    valueClass="text-brand"
                  />
                ) : null}
                <tr className="bg-brand text-white">
                  <th scope="row" className="px-4 py-3.5 text-left font-bold">
                    Giá lăn bánh sau ưu đãi
                  </th>
                  <td className="px-4 py-3.5 text-right text-base font-extrabold">
                    {formatVnd(result.finalTotal, "VNĐ")}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <p className="mt-4 text-[12.5px] leading-6 text-ink-soft">{fees.note}</p>
        <a
          href={PHONE_HREF}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-orange px-4 py-3 text-sm font-bold text-white transition hover:brightness-110"
        >
          <Phone className="size-4" aria-hidden />
          Hotline tư vấn {site.hotline}
        </a>
      </section>

      {/* ------------------------------ Lãi trả góp ------------------------ */}
      <section
        aria-labelledby="tinh-lai-tra-gop"
        className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <h3
          id="tinh-lai-tra-gop"
          className="flex items-center gap-2 text-base font-bold uppercase tracking-wide text-ink"
        >
          <Calculator className="size-4 text-brand" aria-hidden />
          Tính lãi trả góp
        </h3>

        <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor="loan-ratio" className="mb-1.5 block text-[13px] font-semibold text-ink">
              Tỷ lệ vay (% giá lăn bánh)
            </label>
            <select
              id="loan-ratio"
              className={selectClass}
              value={loanRatio}
              onChange={(event) => setLoanRatio(Number(event.target.value))}
            >
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => (
                <option key={value} value={value}>
                  {value} %
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="loan-years" className="mb-1.5 block text-[13px] font-semibold text-ink">
              Thời gian vay (năm)
            </label>
            <input
              id="loan-years"
              type="number"
              min={1}
              max={8}
              value={years}
              onChange={(event) => setYears(Math.min(8, Math.max(1, Number(event.target.value) || 1)))}
              className={selectClass}
            />
          </div>
          <div>
            <label htmlFor="loan-rate" className="mb-1.5 block text-[13px] font-semibold text-ink">
              Lãi suất / năm (%)
            </label>
            <input
              id="loan-rate"
              type="number"
              step="0.1"
              min={0}
              max={30}
              value={rate}
              onChange={(event) => setRate(Number(event.target.value) || 0)}
              className={selectClass}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-[13px] font-semibold text-ink">
              Loại hình trả lãi
            </span>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
              {(
                [
                  { key: "reducing", label: "Dư nợ giảm dần" },
                  { key: "flat", label: "Chia đều" },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setLoanType(item.key)}
                  aria-pressed={loanType === item.key}
                  className={cn(
                    "rounded-lg px-2 py-2 text-[12.5px] font-semibold transition",
                    loanType === item.key
                      ? "bg-background text-brand shadow-sm"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-2.5">
          <Stat label="Số tiền vay" value={formatVnd(loan?.loanAmount ?? 0, "VNĐ")} />
          <Stat
            label="Trả tháng đầu"
            value={formatVnd(loan?.firstMonthPayment ?? 0, "VNĐ")}
            highlight
          />
          <Stat
            label="Tổng lãi phải trả"
            value={formatVnd(loan?.totalInterest ?? 0, "VNĐ")}
            tone="warning"
          />
          <Stat label="Tổng phải trả" value={formatVnd(loan?.totalPayment ?? 0, "VNĐ")} />
        </dl>

        <button
          type="button"
          onClick={() => setShowSchedule((prev) => !prev)}
          aria-expanded={showSchedule}
          disabled={!loan?.rows.length}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold uppercase tracking-wide text-ink transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          {showSchedule ? "Ẩn bảng kỳ trả" : "Xem bảng kỳ trả chi tiết"}
          <ChevronDown
            className={cn("size-4 transition-transform", showSchedule && "rotate-180")}
            aria-hidden
          />
        </button>

        {showSchedule && loan?.rows.length ? (
          <div className="mt-3 max-h-96 overflow-auto rounded-xl border border-border">
            <table className="w-full min-w-[560px] text-right text-[13px]">
              <caption className="sr-only">Bảng lịch trả nợ chi tiết</caption>
              <thead className="sticky top-0 bg-muted text-[12px] uppercase text-ink-soft">
                <tr>
                  <th scope="col" className="px-3 py-2.5 text-left">Kỳ</th>
                  <th scope="col" className="px-3 py-2.5">Dư nợ đầu kỳ</th>
                  <th scope="col" className="px-3 py-2.5">Gốc phải trả</th>
                  <th scope="col" className="px-3 py-2.5">Lãi phải trả</th>
                  <th scope="col" className="px-3 py-2.5">Gốc + Lãi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loan.rows.map((row) => (
                  <tr key={row.period} className="odd:bg-muted/30">
                    <th scope="row" className="px-3 py-2 text-left font-medium">
                      {row.period}
                    </th>
                    <td className="px-3 py-2">{formatNumber(row.opening)}</td>
                    <td className="px-3 py-2">{formatNumber(row.principal)}</td>
                    <td className="px-3 py-2 text-accent-red">{formatNumber(row.interest)}</td>
                    <td className="px-3 py-2 font-semibold">{formatNumber(row.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted font-bold">
                <tr>
                  <td colSpan={3} className="px-3 py-2.5 text-left">Tổng</td>
                  <td className="px-3 py-2.5 text-accent-red">
                    {formatNumber(loan.totalInterest)}
                  </td>
                  <td className="px-3 py-2.5">{formatNumber(loan.totalPayment)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <tr>
      <th scope="row" className="px-4 py-2.5 text-left font-normal text-ink-soft">
        {label}
      </th>
      <td className={cn("px-4 py-2.5 text-right font-semibold text-ink", valueClass)}>
        {value}
      </td>
    </tr>
  );
}

function Stat({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-muted/40 px-3.5 py-3",
        highlight && "border-brand/40 bg-brand-soft",
      )}
    >
      <dt className="text-[12px] font-medium text-ink-soft">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-[15px] font-extrabold text-ink",
          highlight && "text-brand",
          tone === "warning" && "text-accent-red",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
