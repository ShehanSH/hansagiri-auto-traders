import type { Metadata } from "next";
import { TestDriveForm } from "@/components/public/TestDriveForm";
import { getVehicleById } from "@/lib/services/vehicles";
import { vehicleTitle } from "@/utils/format";

export const metadata: Metadata = {
  title: "Book a Test Drive",
  description: "Request a test drive. Appointments are confirmed by Hansagiri Auto Traders.",
};

export default async function TestDrivePage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const { vehicle: vehicleId } = await searchParams;
  const vehicle = vehicleId ? await getVehicleById(vehicleId) : null;
  const label = vehicle ? vehicleTitle(vehicle) : "";

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Test drive</p>
        <h1 className="mt-3 font-display text-4xl text-white">Request a test drive</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Submit a preferred date and time. This is a request only — our team will confirm before
          you visit. No account is required.
        </p>
      </div>
      <TestDriveForm vehicleId={vehicle?.id ?? ""} vehicleLabel={label} />
    </div>
  );
}
