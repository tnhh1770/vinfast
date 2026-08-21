import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  name: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Đường dẫn" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-ink-soft">
        <li className="flex items-center gap-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:text-brand"
          >
            <Home className="size-3.5" aria-hidden />
            <span>Trang chủ</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
              {last ? (
                <span aria-current="page" className="px-1.5 py-1 font-medium text-ink line-clamp-1">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="rounded-md px-1.5 py-1 transition-colors hover:text-brand"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
