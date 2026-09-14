"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from "@/config/constants";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { PriceRangeSlider } from "@/components/ui/PriceRangeSlider";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatPrice } from "@/utils/format";
import { snapPrice } from "@/utils/price-range";

type Props = {
  makes: string[];
  priceMin: number;
  priceMax: number;
  priceStep: number;
  currency?: string;
};

export function VehicleFilters({
  makes,
  priceMin,
  priceMax,
  priceStep,
  currency = "LKR",
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState(params.get("q") ?? "");
  const urlPriceMin = params.get("priceMin") ?? "";
  const urlPriceMax = params.get("priceMax") ?? "";
  const [rangeMin, setRangeMin] = useState(() =>
    urlPriceMin ? snapPrice(Number(urlPriceMin), priceMin, priceMax, priceStep) : priceMin,
  );
  const [rangeMax, setRangeMax] = useState(() =>
    urlPriceMax ? snapPrice(Number(urlPriceMax), priceMin, priceMax, priceStep) : priceMax,
  );
  const debouncedKeyword = useDebouncedValue(keyword, 400);
  const debouncedMin = useDebouncedValue(rangeMin, 350);
  const debouncedMax = useDebouncedValue(rangeMax, 350);
  const lastWrittenPrice = useRef({ min: urlPriceMin, max: urlPriceMax });

  function update(next: Record<string, string>) {
    const search = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) search.set(key, value);
      else search.delete(key);
    });
    search.delete("page");
    router.push(`/vehicles?${search.toString()}`);
  }

  useEffect(() => {
    if (debouncedKeyword !== (params.get("q") ?? "")) {
      update({ q: debouncedKeyword });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  useEffect(() => {
    if (urlPriceMin === lastWrittenPrice.current.min && urlPriceMax === lastWrittenPrice.current.max) {
      return;
    }
    lastWrittenPrice.current = { min: urlPriceMin, max: urlPriceMax };
    setRangeMin(urlPriceMin ? snapPrice(Number(urlPriceMin), priceMin, priceMax, priceStep) : priceMin);
    setRangeMax(urlPriceMax ? snapPrice(Number(urlPriceMax), priceMin, priceMax, priceStep) : priceMax);
  }, [urlPriceMin, urlPriceMax, priceMin, priceMax, priceStep]);

  useEffect(() => {
    const nextMin = debouncedMin <= priceMin ? "" : String(debouncedMin);
    const nextMax = debouncedMax >= priceMax ? "" : String(debouncedMax);
    if (urlPriceMin === nextMin && urlPriceMax === nextMax) {
      return;
    }
    lastWrittenPrice.current = { min: nextMin, max: nextMax };
    update({ priceMin: nextMin, priceMax: nextMax });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, debouncedMax, priceMin, priceMax]);

  const activeCount = useMemo(
    () =>
      ["type", "make", "fuel", "transmission", "body", "q", "yearMin", "yearMax", "priceMin", "priceMax", "mileageMax"].filter(
        (key) => params.get(key),
      ).length,
    [params],
  );

  function renderFields() {
    return (
      <div className="space-y-4">
        <Input
          label="Search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Make, model, or stock ID"
        />
        <Select
          label="New / Pre-owned"
          value={params.get("type") ?? ""}
          onChange={(event) => update({ type: event.target.value })}
        >
          <option value="">All vehicles</option>
          <option value="new">New</option>
          <option value="used">Pre-owned</option>
        </Select>
        <Select
          label="Make"
          value={params.get("make") ?? ""}
          onChange={(event) => update({ make: event.target.value })}
        >
          <option value="">All makes</option>
          {makes.map((make) => (
            <option key={make}>{make}</option>
          ))}
        </Select>
        <Select
          label="Fuel"
          value={params.get("fuel") ?? ""}
          onChange={(event) => update({ fuel: event.target.value })}
        >
          <option value="">All</option>
          {FUEL_TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select
          label="Transmission"
          value={params.get("transmission") ?? ""}
          onChange={(event) => update({ transmission: event.target.value })}
        >
          <option value="">All</option>
          {TRANSMISSIONS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select
          label="Body type"
          value={params.get("body") ?? ""}
          onChange={(event) => update({ body: event.target.value })}
        >
          <option value="">All</option>
          {BODY_TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Min year"
            type="number"
            defaultValue={params.get("yearMin") ?? ""}
            onBlur={(event) => update({ yearMin: event.target.value })}
          />
          <Input
            label="Max year"
            type="number"
            defaultValue={params.get("yearMax") ?? ""}
            onBlur={(event) => update({ yearMax: event.target.value })}
          />
        </div>
        <PriceRangeSlider
          min={priceMin}
          max={priceMax}
          step={priceStep}
          valueMin={rangeMin}
          valueMax={rangeMax}
          formatValue={(value) => formatPrice(value, currency)}
          onChange={(nextMin, nextMax) => {
            setRangeMin(nextMin);
            setRangeMax(nextMax);
          }}
        />
        <Input
          label="Max mileage (km)"
          type="number"
          defaultValue={params.get("mileageMax") ?? ""}
          onBlur={(event) => update({ mileageMax: event.target.value })}
        />
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => {
            setKeyword("");
            setRangeMin(priceMin);
            setRangeMax(priceMax);
            lastWrittenPrice.current = { min: "", max: "" };
            router.push("/vehicles");
          }}
        >
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-72">
      <button
        type="button"
        className="mb-6 inline-flex w-full items-center justify-center gap-2 border border-gold/30 px-3 py-3 text-xs uppercase tracking-[0.16em] text-gold lg:hidden"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter vehicles{activeCount ? ` (${activeCount})` : ""}
      </button>
      <div className="surface-card hidden p-5 lg:block">
        <p className="mb-5 text-xs uppercase tracking-[0.2em] text-gold">Refine search</p>
        {renderFields()}
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[min(100%,400px)] overflow-y-auto bg-dark p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Filter vehicles</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X />
              </button>
            </div>
            {renderFields()}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
