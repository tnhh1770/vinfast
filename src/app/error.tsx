"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
        Đã có lỗi xảy ra
      </h1>
      <p className="mt-3 max-w-md leading-7 text-ink-soft">
        Vui lòng thử lại. Nếu lỗi tiếp diễn, hãy gọi hotline 0906 412 894 để được hỗ
        trợ trực tiếp.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
      >
        <RotateCcw className="size-4" aria-hidden />
        Thử lại
      </button>
    </div>
  );
}
