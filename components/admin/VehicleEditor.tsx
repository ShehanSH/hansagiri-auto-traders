"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  VEHICLE_FEATURES,
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
} from "@/config/constants";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { hasRole } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/services/crm";
import { uploadAdminImage } from "@/lib/services/media";
import {
  archiveVehicle,
  createVehicle,
  getVehicleById,
  updateVehicle,
} from "@/lib/services/vehicles";
import { vehicleSchema } from "@/lib/validation/vehicle";
import { toUserMessage } from "@/utils/errors";
import type { VehicleFeature, VehicleImage } from "@/types";

export function VehicleEditor({ vehicleId }: { vehicleId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const canWrite = hasRole(admin?.role, "vehicles:write") || hasRole(admin?.role, "*");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [features, setFeatures] = useState<VehicleFeature[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [defaults, setDefaults] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!vehicleId) return;
    getVehicleById(vehicleId, { admin: true }).then((vehicle) => {
      if (!vehicle) return;
      setImages(vehicle.images);
      setFeatures(vehicle.features);
      setDefaults({
        stockId: vehicle.stockId,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        year: String(vehicle.year),
        price: String(vehicle.price),
        currency: vehicle.currency,
        mileage: String(vehicle.mileage),
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        bodyType: vehicle.bodyType,
        engine: vehicle.engine,
        color: vehicle.color,
        condition: vehicle.condition,
        registrationStatus: vehicle.registrationStatus,
        description: vehicle.description,
        location: vehicle.location,
        vehicleType: vehicle.vehicleType,
        status: vehicle.status,
        featured: vehicle.featured ? "true" : "false",
      });
    });
  }, [vehicleId]);

  async function onFiles(files: FileList | null) {
    if (!files || !admin) return;
    try {
      const uploaded: VehicleImage[] = [];
      for (const file of Array.from(files)) {
        const asset = await uploadAdminImage(file, "vehicles", admin.uid);
        uploaded.push({
          url: asset.url,
          path: asset.path,
          alt: file.name,
          sortOrder: images.length + uploaded.length,
        });
      }
      setImages((current) => [...current, ...uploaded]);
    } catch (error) {
      toast.push(toUserMessage(error), "error");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite || !admin) return;
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = vehicleSchema.safeParse({
      ...form,
      featured: form.featured === "true",
      features,
    });
    if (!parsed.success) {
      toast.push(parsed.error.issues[0]?.message ?? "Check the vehicle details", "error");
      return;
    }
    setLoading(true);
    try {
      if (vehicleId) {
        await updateVehicle(vehicleId, { ...parsed.data, images }, admin.uid);
        await logActivity({
          userId: admin.uid,
          userEmail: admin.email,
          action: parsed.data.status === "sold" ? "Vehicle marked sold" : "Vehicle updated",
          entityType: "vehicle",
          entityId: vehicleId,
        });
        toast.push("Vehicle saved");
      } else {
        const created = await createVehicle({ ...parsed.data, features }, admin.uid);
        await updateVehicle(created.id, { images }, admin.uid);
        await logActivity({
          userId: admin.uid,
          userEmail: admin.email,
          action: "Vehicle created",
          entityType: "vehicle",
          entityId: created.id,
        });
        toast.push("Vehicle created as configured status");
        router.replace(`/admin/vehicles/${created.id}`);
      }
    } catch (error) {
      toast.push(toUserMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="stockId" label="Stock ID" defaultValue={defaults.stockId} required />
        <Select name="status" label="Status" defaultValue={defaults.status ?? "draft"} key={defaults.status}>
          {VEHICLE_STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Input name="make" label="Make" defaultValue={defaults.make} required />
        <Input name="model" label="Model" defaultValue={defaults.model} required />
        <Input name="variant" label="Variant" defaultValue={defaults.variant} />
        <Input name="year" type="number" label="Year" defaultValue={defaults.year} required />
        <Input name="price" type="number" label="Price" defaultValue={defaults.price} required />
        <Input name="currency" label="Currency" defaultValue={defaults.currency ?? "LKR"} />
        <Input name="mileage" type="number" label="Mileage" defaultValue={defaults.mileage} required />
        <Select name="fuelType" label="Fuel" defaultValue={defaults.fuelType} key={`f-${defaults.fuelType}`}>
          {FUEL_TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select name="transmission" label="Transmission" defaultValue={defaults.transmission} key={`t-${defaults.transmission}`}>
          {TRANSMISSIONS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select name="bodyType" label="Body type" defaultValue={defaults.bodyType} key={`b-${defaults.bodyType}`}>
          {BODY_TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Input name="engine" label="Engine" defaultValue={defaults.engine} />
        <Input name="color" label="Color" defaultValue={defaults.color} />
        <Input name="condition" label="Condition" defaultValue={defaults.condition} />
        <Input name="registrationStatus" label="Registration" defaultValue={defaults.registrationStatus} />
        <Input name="location" label="Location" defaultValue={defaults.location} />
        <Select name="vehicleType" label="New / Used" defaultValue={defaults.vehicleType ?? "used"} key={defaults.vehicleType}>
          {VEHICLE_TYPES.map((item) => (
            <option key={item} value={item}>
              {item === "new" ? "New" : "Pre-owned"}
            </option>
          ))}
        </Select>
        <Select name="featured" label="Featured" defaultValue={defaults.featured ?? "false"} key={defaults.featured}>
          <option value="false">No</option>
          <option value="true">Yes</option>
        </Select>
      </div>
      <Textarea name="description" label="Description" defaultValue={defaults.description} />
      <fieldset>
        <legend className="mb-3 text-xs uppercase tracking-[0.18em] text-gold-champagne/80">Features</legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {VEHICLE_FEATURES.map((feature) => (
            <label key={feature} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={features.includes(feature)}
                onChange={(event) => {
                  setFeatures((current) =>
                    event.target.checked
                      ? [...current, feature]
                      : current.filter((item) => item !== feature),
                  );
                }}
              />
              {feature}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-gold-champagne/80">Images</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={!canWrite}
          onChange={(event) => onFiles(event.target.files)}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div key={`${image.path}-${index}`} className="relative">
              <img src={image.url} alt="" className="h-28 w-full object-cover" />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="text-xs text-gold"
                  onClick={() =>
                    setImages((current) => {
                      const next = [...current];
                      const [item] = next.splice(index, 1);
                      next.unshift(item);
                      return next.map((entry, sortOrder) => ({ ...entry, sortOrder }));
                    })
                  }
                >
                  Primary
                </button>
                <button
                  type="button"
                  className="text-xs text-danger"
                  onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {canWrite ? (
        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={loading}>
            Save vehicle
          </Button>
          {vehicleId ? (
            <Button type="button" variant="danger" onClick={() => setConfirm(true)}>
              Archive
            </Button>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted">Read-only access</p>
      )}
      <ConfirmDialog
        open={confirm}
        title="Archive this vehicle?"
        description="It will be hidden from the public website."
        confirmLabel="Archive"
        danger
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          if (!vehicleId || !admin) return;
          await archiveVehicle(vehicleId, admin.uid);
          await logActivity({
            userId: admin.uid,
            userEmail: admin.email,
            action: "Vehicle archived",
            entityType: "vehicle",
            entityId: vehicleId,
          });
          setConfirm(false);
          toast.push("Vehicle archived");
          router.push("/admin/vehicles");
        }}
      />
    </form>
  );
}
