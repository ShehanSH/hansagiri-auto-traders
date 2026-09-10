"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Field";

export function VehicleToolbar({ total }: { total: number }) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-gold/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <p className="text-sm text-muted">
        <span className="text-white">{total}</span> vehicle{total === 1 ? "" : "s"} available
      </p>
      <div className="w-full sm:max-w-xs">
        <Select
          label="Sort by"
          value={params.get("sort") ?? "newest"}
          onChange={(event) => {
            const search = new URLSearchParams(params.toString());
            if (event.target.value && event.target.value !== "newest") {
              search.set("sort", event.target.value);
            } else {
              search.delete("sort");
            }
            search.delete("page");
            router.push(`/vehicles?${search.toString()}`);
          }}
        >
          <option value="newest">Newest listed</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="year_desc">Year: Newest</option>
          <option value="mileage_asc">Mileage: Lowest</option>
        </Select>
      </div>
    </div>
  );
}

export function VehiclePagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <Pagination
      page={page}
      pageSize={pageSize}
      total={total}
      onPage={(next) => {
        const search = new URLSearchParams(params.toString());
        search.set("page", String(next));
        router.push(`/vehicles?${search.toString()}`);
      }}
    />
  );
}
