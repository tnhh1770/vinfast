"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { submitLead, type LeadState } from "@/app/actions/lead";
import { cn } from "@/lib/utils";

const initialState: LeadState = { status: "idle", message: "" };

interface LeadFormProps {
  source: string;
  defaultCar?: string;
  withCarField?: boolean;
  withMessage?: boolean;
  tone?: "light" | "dark";
  submitLabel?: string;
  className?: string;
}

function SubmitButton({ label, tone }: { label: string; tone: "light" | "dark" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-70",
        tone === "dark"
          ? "bg-accent-orange text-white hover:brightness-110"
          : "bg-brand text-white hover:bg-brand-dark",
      )}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Send className="size-4" aria-hidden />
      )}
      {pending ? "Đang gửi..." : label}
    </button>
  );
}

export function LeadForm(props: LeadFormProps) {
  const [state, formAction] = useActionState(submitLead, initialState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error" && !state.errors) {
      toast.error(state.message);
    }
  }, [state]);

  // Đổi key sau mỗi lần gửi thành công -> form được mount lại và xoá trắng.
  return <LeadFormFields key={state.token ?? "form"} {...props} state={state} action={formAction} />;
}

function LeadFormFields({
  source,
  defaultCar,
  withCarField = false,
  withMessage = false,
  tone = "light",
  submitLabel = "Đăng ký",
  className,
  state,
  action,
}: LeadFormProps & {
  state: LeadState;
  action: (formData: FormData) => void;
}) {
  const pathname = usePathname();
  const uid = useId();

  /**
   * React 19 tự reset input không kiểm soát sau khi form action chạy xong,
   * nên dùng state có kiểm soát để người dùng không mất dữ liệu khi nhập sai.
   */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [car, setCar] = useState(defaultCar ?? "");
  const [message, setMessage] = useState("");

  const inputClass = cn(
    "h-12 w-full rounded-xl border px-4 text-sm outline-none transition",
    tone === "dark"
      ? "border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:border-white/50"
      : "border-border bg-background text-ink placeholder:text-ink-soft/60 focus:border-brand focus:ring-3 focus:ring-brand/15",
  );

  const labelClass = cn(
    "mb-1.5 block text-[13px] font-semibold",
    tone === "dark" ? "text-white/85" : "text-ink",
  );

  const errorClass = "mt-1 text-xs font-medium text-accent-red";

  return (
    <form action={action} className={cn("space-y-3.5", className)} noValidate>
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="path" value={pathname} />

      {/* honeypot chống bot */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className={labelClass} htmlFor={`${uid}-name`}>
          Tên của bạn <span className="text-accent-red">*</span>
        </label>
        <input
          id={`${uid}-name`}
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          className={inputClass}
          aria-invalid={Boolean(state.errors?.name)}
          aria-describedby={state.errors?.name ? `${uid}-name-error` : undefined}
        />
        {state.errors?.name ? (
          <p id={`${uid}-name-error`} className={errorClass}>
            {state.errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label className={labelClass} htmlFor={`${uid}-phone`}>
          Số điện thoại <span className="text-accent-red">*</span>
        </label>
        <input
          id={`${uid}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          autoComplete="tel"
          placeholder="09xx xxx xxx"
          className={inputClass}
          aria-invalid={Boolean(state.errors?.phone)}
          aria-describedby={state.errors?.phone ? `${uid}-phone-error` : undefined}
        />
        {state.errors?.phone ? (
          <p id={`${uid}-phone-error`} className={errorClass}>
            {state.errors.phone}
          </p>
        ) : null}
      </div>

      {withCarField ? (
        <div>
          <label className={labelClass} htmlFor={`${uid}-car`}>
            Dòng xe quan tâm
          </label>
          <input
            id={`${uid}-car`}
            name="carInterest"
            value={car}
            onChange={(event) => setCar(event.target.value)}
            placeholder="VinFast VF 3"
            className={inputClass}
          />
        </div>
      ) : (
        <input type="hidden" name="carInterest" value={defaultCar ?? ""} />
      )}

      {withMessage ? (
        <div>
          <label className={labelClass} htmlFor={`${uid}-message`}>
            Nội dung cần tư vấn
          </label>
          <textarea
            id={`${uid}-message`}
            name="message"
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tôi muốn được báo giá lăn bánh và lịch lái thử..."
            className={cn(inputClass, "h-auto py-3 leading-6")}
          />
        </div>
      ) : null}

      <SubmitButton label={submitLabel} tone={tone} />

      <p
        className={cn(
          "text-center text-[11.5px] leading-5",
          tone === "dark" ? "text-white/60" : "text-ink-soft",
        )}
      >
        Thông tin của bạn được bảo mật theo{" "}
        <Link href="/chinh-sach-bao-mat" className="underline underline-offset-2">
          Chính sách bảo mật
        </Link>
        .
      </p>
    </form>
  );
}
