"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlusIcon, Loader2Icon, PlusIcon, UploadIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ApiRequestError, createVan, uploadVanImage, type Van, type VehicleType } from "@/lib/api";

export function AddVanForm({
  token,
  onCreated,
  onUpdated,
}: {
  token: string;
  onCreated: (van: Van) => void;
  onUpdated: (van: Van) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [type, setType] = useState<VehicleType>("van");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Set only if the van was created but the photo upload failed, so the van isn't re-created on retry.
  const [pendingVanId, setPendingVanId] = useState<string | null>(null);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function reset() {
    setName("");
    setDescription("");
    setPricePerDay("");
    setType("van");
    setPhoto(null);
    setError("");
    setPendingVanId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Retry path: van already exists, only the photo upload needs retrying.
    if (pendingVanId) {
      if (!photo) {
        setOpen(false);
        reset();
        return;
      }
      setSaving(true);
      setError("");
      try {
        const updated = await uploadVanImage(pendingVanId, photo, token);
        onUpdated(updated);
        reset();
        setOpen(false);
      } catch (err) {
        setError(err instanceof ApiRequestError ? err.message : "Couldn't upload the photo. Try again.");
      } finally {
        setSaving(false);
      }
      return;
    }

    const price = Number(pricePerDay);
    if (!name.trim() || !description.trim() || !Number.isFinite(price) || price <= 0) {
      setError("Fill in a name, description, and a valid price.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const van = await createVan({ name, description, pricePerDay: price, type }, token);
      onCreated(van);

      if (photo) {
        try {
          const updated = await uploadVanImage(van.id, photo, token);
          onUpdated(updated);
        } catch (err) {
          // Van exists, only the photo failed — let them retry just the upload.
          setPendingVanId(van.id);
          setError(
            err instanceof ApiRequestError
              ? `Van added, but the photo didn't upload: ${err.message}`
              : "Van added, but the photo didn't upload. Try again.",
          );
          setSaving(false);
          return;
        }
      }

      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't add the van. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="w-fit bg-brand text-brand-foreground hover:bg-brand/90">
        <PlusIcon className="size-4" />
        Add van
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h2 className="font-semibold">{pendingVanId ? "Retry photo upload" : "Add a van"}</h2>

      {!pendingVanId && (
        <>
          <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-name">Name</Label>
              <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Weekend Camper" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-price">Price / day</Label>
              <Input
                id="new-price"
                type="number"
                min="1"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                placeholder="95"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <div className="flex gap-1 rounded-lg border border-input p-0.5">
                {(["van", "bus"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "flex-1 rounded-md py-1 text-sm font-medium capitalize transition-colors",
                      type === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-description">Description</Label>
            <textarea
              id="new-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Cozy 2-berth camper, ideal for weekend trips."
              className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Photo {pendingVanId ? "" : "(optional)"}</Label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
        {photoPreview ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Selected van photo" className="size-16 rounded-lg object-cover ring-1 ring-foreground/10" />
            <Button type="button" variant="outline" size="sm" onClick={() => setPhoto(null)}>
              <XIcon className="size-3.5" /> Remove
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" className="w-fit" onClick={() => inputRef.current?.click()}>
            <ImagePlusIcon className="size-4" />
            Choose photo
          </Button>
        )}
        {!pendingVanId && (
          <p className="text-xs text-muted-foreground">
            No photo chosen? A placeholder is used — swap it later from the list below.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            setOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="bg-brand text-brand-foreground hover:bg-brand/90">
          {saving && <Loader2Icon className="size-4 animate-spin" />}
          {saving ? (
            "Saving…"
          ) : pendingVanId ? (
            <>
              <UploadIcon className="size-4" /> Retry upload
            </>
          ) : (
            "Add van"
          )}
        </Button>
      </div>
    </form>
  );
}
