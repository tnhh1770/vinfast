import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h2" | "h3";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
          <span className="size-1.5 rounded-full bg-brand" aria-hidden />
          {eyebrow}
        </span>
      ) : null}
      <Tag className="text-3xl font-bold text-ink sm:text-4xl">{title}</Tag>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-[15px] leading-7 text-ink-soft",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
