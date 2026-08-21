"use client";

import { useMemo, useState } from "react";

import { CarCard } from "@/components/car/car-card";
import { cn } from "@/lib/utils";
import type { Car } from "@/types";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "xe-vinfast", label: "Xe VinFast" },
  { key: "xe-dich-vu", label: "Xe Dịch Vụ" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function CarGridTabs({
  cars,
  priorityCount = 0,
}: {
  cars: Car[];
  priorityCount?: number;
}) {
  const [tab, setTab] = useState<TabKey>("all");

  const filtered = useMemo(
    () => (tab === "all" ? cars : cars.filter((car) => car.group === tab)),
    [cars, tab],
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Lọc theo nhóm xe"
        className="mx-auto mb-7 flex w-fit gap-1 rounded-full bg-muted p-1"
      >
        {TABS.map((item) => (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-full px-4 py-2 text-[13.5px] font-semibold transition sm:px-5",
              tab === item.key
                ? "bg-background text-brand shadow-sm"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((car, index) => (
          <li key={car.slug}>
            <CarCard car={car} priority={index < priorityCount} />
          </li>
        ))}
      </ul>
    </div>
  );
}
