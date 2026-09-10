"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { VehicleImage } from "@/types";

export function VehicleGallery({
  images,
  title,
}: {
  images: VehicleImage[];
  title: string;
}) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const current = sorted[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") setIndex((value) => (value + 1) % sorted.length);
      if (event.key === "ArrowLeft") {
        setIndex((value) => (value - 1 + sorted.length) % sorted.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, sorted.length]);

  if (!current) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center bg-charcoal text-muted">
        No images yet
      </div>
    );
  }

  function step(delta: number) {
    setIndex((value) => (value + delta + sorted.length) % sorted.length);
  }

  return (
    <div>
      <button
        type="button"
        className="relative block aspect-[16/10] w-full overflow-hidden bg-charcoal"
        onClick={() => setOpen(true)}
      >
        <Image
          src={current.url}
          alt={current.alt || title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
      </button>
      {sorted.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {sorted.map((image, imageIndex) => (
            <button
              key={`${image.path}-${imageIndex}`}
              type="button"
              className={`relative h-16 w-24 shrink-0 overflow-hidden border ${
                imageIndex === index ? "border-gold" : "border-transparent"
              }`}
              onClick={() => setIndex(imageIndex)}
            >
              <Image src={image.url} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            className="absolute right-4 top-4 text-white"
            aria-label="Close gallery"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
          <button
            type="button"
            className="absolute left-4 text-white"
            aria-label="Previous image"
            onClick={() => step(-1)}
          >
            <ChevronLeft />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image src={current.url} alt={current.alt || title} fill className="object-contain" />
          </div>
          <button
            type="button"
            className="absolute right-4 text-white"
            aria-label="Next image"
            onClick={() => step(1)}
          >
            <ChevronRight />
          </button>
        </div>
      ) : null}
    </div>
  );
}
