import { VehicleCardSkeleton } from "@/components/ui/Feedback";

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 md:grid-cols-3">
      <VehicleCardSkeleton />
      <VehicleCardSkeleton />
      <VehicleCardSkeleton />
    </div>
  );
}
