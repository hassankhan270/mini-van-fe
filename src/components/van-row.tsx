"use client";

import { useRef, useState } from "react";
import { Loader2Icon, PencilIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VanImage } from "@/components/van-image";
import { cn } from "@/lib/utils";
import { ApiRequestError, deleteVan, updateVan, uploadVanImage, type Van, type VehicleType } from "@/lib/api";

export function VanRow({
  van,
  token,
  onChanged,
  onDeleted,
}: {
  van: Van;
  token: string;
  onChanged: (van: Van) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [name, setName] = useState(van.name);
  const [description, setDescription] = useState(van.description);
  const [pricePerDay, setPricePerDay] = useState(String(van.pricePerDay));
  const [type, setType] = useState<VehicleType>(van.type);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setName(van.name);
    setDescription(van.description);
    setPricePerDay(String(van.pricePerDay));
    setType(van.type);
    setError("");
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(pricePerDay);
    if (!name.trim() || !description.trim() || !Number.isFinite(price) || price <= 0) {
      setError("Fill in a name, description, and a valid price.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await updateVan(van.id, { name, description, pricePerDay: price, type }, token);
      onChanged(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't save changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const updated = await uploadVanImage(van.id, file, token);
      onChanged(updated);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await deleteVan(van.id, token);
      onDeleted(van.id);
    } catch (err) {
      setConfirmingDelete(false);
      setError(
        err instanceof ApiRequestError && err.status === 409
          ? "Can't delete — this van has reservations. Remove those first."
          : err instanceof ApiRequestError
            ? err.message
            : "Couldn't delete this van. Try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center gap-4">
        <VanImage src={van.imageUrl} alt={van.name} className="size-20 shrink-0 rounded-lg" />
        <div className="flex min-w-40 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{van.name}</p>
            <Badge variant="outline" className="capitalize">{van.type}</Badge>
          </div>
          <p className="font-mono text-sm text-muted-foreground">${van.pricePerDay}/day</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2Icon className="size-4 animate-spin" /> : <UploadIcon className="size-4" />}
            {uploading ? "Uploading…" : "Photo"}
          </Button>
          <Button type="button" variant="outline" onClick={() => (editing ? setEditing(false) : startEdit())}>
            <PencilIcon className="size-4" />
            {editing ? "Cancel" : "Edit"}
          </Button>
          {!confirmingDelete ? (
            <Button
              type="button"
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2Icon className="size-4" />
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setConfirmingDelete(false)}>
                Keep
              </Button>
              <Button
                type="button"
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                {deleting && <Loader2Icon className="size-4 animate-spin" />}
                {deleting ? "Deleting…" : "Confirm delete"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`name-${van.id}`}>Name</Label>
              <Input id={`name-${van.id}`} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`price-${van.id}`}>Price / day</Label>
              <Input
                id={`price-${van.id}`}
                type="number"
                min="1"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
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
            <Label htmlFor={`description-${van.id}`}>Description</Label>
            <textarea
              id={`description-${van.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-brand text-brand-foreground hover:bg-brand/90 sm:w-fit">
            {saving && <Loader2Icon className="size-4 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
