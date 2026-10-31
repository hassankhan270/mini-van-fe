const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type VehicleType = "van" | "bus";

export type Van = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: VehicleType;
  pricePerDay: number;
  createdAt: string;
};

export type Reservation = {
  id: string;
  van: Van;
  vanId: string;
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isLocked: boolean;
  createdAt: string;
};

export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
};

export class ApiRequestError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null) {
    super(
      body ? (Array.isArray(body.message) ? body.message.join(", ") : body.message) : `Request failed (${status})`,
    );
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiRequestError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function login(username: string, password: string) {
  return request<{ accessToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getVans(type?: VehicleType) {
  const qs = type ? `?${new URLSearchParams({ type }).toString()}` : "";
  return request<Van[]>(`/vans${qs}`);
}

export async function getVan(id: string) {
  try {
    return await request<Van>(`/vans/${id}`);
  } catch (err) {
    if (err instanceof ApiRequestError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
}

export type VanInput = {
  name: string;
  description: string;
  pricePerDay: number;
  imageUrl?: string;
  type?: VehicleType;
};

export function createVan(input: VanInput, token: string) {
  return request<Van>("/vans", { method: "POST", body: JSON.stringify(input) }, token);
}

export function updateVan(id: string, input: Partial<VanInput>, token: string) {
  return request<Van>(`/vans/${id}`, { method: "PATCH", body: JSON.stringify(input) }, token);
}

export function deleteVan(id: string, token: string) {
  return request<void>(`/vans/${id}`, { method: "DELETE" }, token);
}

export type DateRange = { startDate: string; endDate: string };

export function getBookedDates(vanId: string) {
  const params = new URLSearchParams({ vanId });
  return request<DateRange[]>(`/reservations/booked-dates?${params.toString()}`);
}

export function checkAvailability(vanId: string, startDate: string, endDate: string) {
  const params = new URLSearchParams({ vanId, startDate, endDate });
  return request<{ available: boolean }>(`/reservations/availability?${params.toString()}`);
}

export function getAvailableVans(startDate: string, endDate: string, type?: VehicleType) {
  const params = new URLSearchParams({ startDate, endDate });
  if (type) params.set("type", type);
  return request<Van[]>(`/vans/available?${params.toString()}`);
}

export type CreateReservationInput = {
  vanId: string;
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export function createReservation(input: CreateReservationInput) {
  return request<Reservation>("/reservations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getReservations(
  token: string,
  filters?: { vanId?: string; type?: VehicleType; startDate?: string; endDate?: string },
) {
  const params = new URLSearchParams();
  if (filters?.vanId) params.set("vanId", filters.vanId);
  if (filters?.type) params.set("type", filters.type);
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  const qs = params.toString();
  return request<Reservation[]>(`/reservations${qs ? `?${qs}` : ""}`, undefined, token);
}

export async function getReservation(id: string) {
  try {
    return await request<Reservation>(`/reservations/${id}`);
  } catch (err) {
    if (err instanceof ApiRequestError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
}

export function toggleLock(id: string) {
  return request<Reservation>(`/reservations/${id}/lock`, { method: "PATCH" });
}

export async function uploadVanImage(id: string, file: File, token: string) {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_BASE_URL}/vans/${id}/image`, {
    method: "PATCH",
    body: form,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiRequestError(res.status, body);
  }
  return (await res.json()) as Van;
}

// `date.toISOString()` converts through UTC first, which shifts the calendar
// date by a day in timezones ahead of UTC (e.g. midnight in UTC+5 is still
// 7pm the previous day in UTC). Read the local Y/M/D components directly
// instead, so "today" and calendar dates match what the clock on the wall says.
export function toLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayLocalISO() {
  return toLocalISODate(new Date());
}

export function rentalDays(startDate: string, endDate: string) {
  const diff = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
}
