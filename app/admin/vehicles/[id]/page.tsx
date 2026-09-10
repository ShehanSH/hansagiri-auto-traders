"use client";

import { useParams } from "next/navigation";
import { VehicleEditor } from "@/components/admin/VehicleEditor";

export default function EditVehiclePage() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">Edit vehicle</h1>
      <VehicleEditor vehicleId={params.id} />
    </div>
  );
}
