"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BODY_TYPES,
  BRAND_NAME,
  FUEL_TYPES,
  TRANSMISSIONS,
  VEHICLE_FEATURES,
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
  MAX_VEHICLE_IMAGES,
} from "@/config/constants";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { ImageUploadButton } from "@/components/ui/ImageUploadButton";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { hasRole } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/services/crm";
import { uploadAdminImage } from "@/lib/services/media";
import {
  archiveVehicle,
  createVehicle,
  deleteVehicle,
  getNextStockId,
  getVehicleById,
  updateVehicle,
} from "@/lib/services/vehicles";
import { buildVehicleSeo, composeNameFromDraft } from "@/lib/seo/content";
import { vehicleSchema } from "@/lib/validation/vehicle";
import { ensureFirebaseConfigured } from "@/lib/env";
import { composeVehicleName } from "@/utils/format";
import { toUserMessage } from "@/utils/errors";
import type { VehicleFeature, VehicleImage } from "@/types";

export function VehicleEditor({ vehicleId }: { vehicleId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const canWrite = hasRole(admin?.role, "vehicles:write") || hasRole(admin?.role, "*");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [features, setFeatures] = useState<VehicleFeature[]>([]);
  const [confirm, setConfirm] = useState<"archive" | "delete" | null>(null);
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [stockId, setStockId] = useState("");
  const [name, setName] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [seoTouched, setSeoTouched] = useState(false);

  useEffect(() => {
    if (vehicleId) {
      getVehicleById(vehicleId, { admin: true }).then((vehicle) => {
        if (!vehicle) return;
        setImages(vehicle.images);
        setFeatures(vehicle.features);
        setStockId(vehicle.stockId);
        setName(vehicle.name || composeVehicleName(vehicle));
        setSeoTitle(vehicle.seoTitle || "");
        setSeoDescription(vehicle.seoDescription || "");
        setNameTouched(Boolean(vehicle.name && vehicle.name !== composeVehicleName(vehicle)));
        const generated = buildVehicleSeo(vehicle, BRAND_NAME);
        setSeoTouched(
          Boolean(
            (vehicle.seoTitle && vehicle.seoTitle !== generated.title) ||
              (vehicle.seoDescription && vehicle.seoDescription !== generated.description),
          ),
        );
        setDefaults({
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
      return;
    }

    getNextStockId().then(setStockId).catch(() => setStockId("HT-001"));
  }, [vehicleId]);

  function refreshGeneratedFields() {
    const form = formRef.current;
    if (!form) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const draft = {
      year: Number(data.year || 0),
      make: String(data.make || ""),
      model: String(data.model || ""),
      variant: String(data.variant || ""),
      price: Number(data.price || 0),
      currency: String(data.currency || "LKR"),
      mileage: Number(data.mileage || 0),
      fuelType: String(data.fuelType || ""),
      transmission: String(data.transmission || ""),
      bodyType: String(data.bodyType || ""),
      color: String(data.color || ""),
      location: String(data.location || ""),
      vehicleType: String(data.vehicleType || "used"),
      description: String(data.description || ""),
    };
    const generatedName = composeNameFromDraft(draft);
    const formName = String(data.name || "");
    const nextName = nameTouched ? formName : generatedName;
    if (!nameTouched) setName(generatedName);
    if (!seoTouched) {
      const seo = buildVehicleSeo({ ...draft, name: nextName }, BRAND_NAME);
      setSeoTitle(seo.title);
      setSeoDescription(seo.description);
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length || !admin || uploading) return;
    const selected = Array.from(files).slice(0, Math.max(0, MAX_VEHICLE_IMAGES - images.length));
    if (!selected.length) {
      toast.push(`You can add up to ${MAX_VEHICLE_IMAGES} images.`, "error");
      return;
    }

    setUploading(true);
    setUploadStatus(
      selected.length === 1 ? "Image uploading…" : `Image uploading… 1 of ${selected.length}`,
    );
    try {
      await ensureFirebaseConfigured();
      for (const [index, file] of selected.entries()) {
        setUploadStatus(
          selected.length === 1
            ? "Image uploading…"
            : `Image uploading… ${index + 1} of ${selected.length}`,
        );
        const asset = await uploadAdminImage(file, "vehicles", admin.uid);
        setImages((current) => [
          ...current,
          {
            url: asset.url,
            path: asset.path,
            alt: `${name || "Vehicle"} photo ${current.length + 1}`,
            sortOrder: current.length,
          },
        ]);
      }
    } catch (error) {
      toast.push(toUserMessage(error), "error");
    } finally {
      setUploading(false);
      setUploadStatus("");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite || !admin) return;
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = vehicleSchema.safeParse({
      ...form,
      stockId,
      name,
      seoTitle,
      seoDescription,
      featured: form.featured === "true",
      features,
    });
    if (!parsed.success) {
      toast.push(parsed.error.issues[0]?.message ?? "Check the vehicle details", "error");
      return;
    }
    setLoading(true);
    try {
      await ensureFirebaseConfigured();
      if (vehicleId) {
        await updateVehicle(vehicleId, { ...parsed.data, images }, admin.uid);
        await logActivity({
          userId: admin.uid,
          userEmail: admin.email,
          action: parsed.data.status === "sold" ? "Vehicle marked sold" : "Vehicle updated",
          entityType: "vehicle",
          entityId: vehicleId,
        });
        toast.push(
          parsed.data.status === "draft"
            ? "Vehicle saved as a draft. Set status to Available to show it on the website."
            : "Vehicle saved",
        );
      } else {
        const created = await createVehicle({ ...parsed.data, features }, admin.uid, images);
        await logActivity({
          userId: admin.uid,
          userEmail: admin.email,
          action: "Vehicle created",
          entityType: "vehicle",
          entityId: created.id,
        });
        toast.push(
          parsed.data.status === "draft"
            ? "Vehicle saved as a draft. Set status to Available to show it on the website."
            : "Vehicle created",
        );
        router.replace(`/admin/vehicles/${created.id}`);
      }
    } catch (error) {
      toast.push(toUserMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} onInput={refreshGeneratedFields} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          name="stockId"
          label="Stock ID"
          value={stockId}
          readOnly
          onChange={() => undefined}
          hint="Assigned automatically from the next available stock ID."
        />
        <Select
          name="status"
          label="Status"
          defaultValue={defaults.status ?? "available"}
          key={defaults.status || "available"}
          hint="Available vehicles appear on the public website. Draft stays hidden."
        >
          {VEHICLE_STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Input
          name="name"
          label="Vehicle name"
          value={name}
          onChange={(event) => {
            setNameTouched(true);
            setName(event.target.value);
          }}
          hint="Auto-filled from year, make, model, and variant. You can edit it."
          required
        />
        <Input name="year" type="number" label="Year" defaultValue={defaults.year} required />
        <Input name="make" label="Make" defaultValue={defaults.make} required />
        <Input name="model" label="Model" defaultValue={defaults.model} required />
        <Input name="variant" label="Variant" defaultValue={defaults.variant} />
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
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          name="seoTitle"
          label="SEO title"
          value={seoTitle}
          onChange={(event) => {
            setSeoTouched(true);
            setSeoTitle(event.target.value);
          }}
          hint="Auto-filled from the vehicle details for Google and social sharing."
        />
        <Textarea
          name="seoDescription"
          label="SEO description"
          value={seoDescription}
          onChange={(event) => {
            setSeoTouched(true);
            setSeoDescription(event.target.value);
          }}
        />
      </div>
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
        <ImageUploadButton
          disabled={!canWrite}
          uploading={uploading}
          status={uploadStatus}
          buttonLabel="Add images"
          onSelect={onFiles}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div key={`${image.path}-${index}`} className="relative">
              <img src={image.url} alt={image.alt || name} className="h-28 w-full object-cover" />
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
          <Button type="submit" loading={loading} disabled={uploading}>
            Save vehicle
          </Button>
          {vehicleId ? (
            <>
              <Button type="button" variant="secondary" onClick={() => setConfirm("archive")}>
                Archive
              </Button>
              <Button type="button" variant="danger" onClick={() => setConfirm("delete")}>
                Delete
              </Button>
            </>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted">Read-only access</p>
      )}
      <ConfirmDialog
        open={confirm === "archive"}
        title="Archive this vehicle?"
        description="It will be hidden from the public website, but you can still find it in admin under Archived."
        confirmLabel="Archive"
        danger
        onClose={() => setConfirm(null)}
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
          setConfirm(null);
          toast.push("Vehicle archived");
          router.push("/admin/vehicles");
        }}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        title="Delete this vehicle?"
        description="This permanently removes the listing from the admin dashboard and the public website. This cannot be undone."
        confirmLabel="Delete"
        danger
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          if (!vehicleId || !admin) return;
          await deleteVehicle(vehicleId, stockId);
          await logActivity({
            userId: admin.uid,
            userEmail: admin.email,
            action: "Vehicle deleted",
            entityType: "vehicle",
            entityId: vehicleId,
          });
          setConfirm(null);
          toast.push("Vehicle deleted");
          router.push("/admin/vehicles");
        }}
      />
    </form>
  );
}
