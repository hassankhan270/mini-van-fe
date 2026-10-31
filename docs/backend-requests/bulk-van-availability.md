# Backend request: bulk van availability endpoint

**Status:** ✅ built and wired into the frontend (`GET /vans/available`)
**Requested by:** frontend (`/fleet` date filter)
**Why:** the fleet date filter currently does N requests instead of 1, and that gets worse as the fleet grows.

## The problem

`/fleet` lets a customer pick a pickup/return date range and see only the vans free for those dates. There's no bulk endpoint for "which vans are free for this range," so the frontend calls the existing per-van endpoint once for every van in the fleet:

```
GET /reservations/availability?vanId=<id1>&startDate=...&endDate=...
GET /reservations/availability?vanId=<id2>&startDate=...&endDate=...
GET /reservations/availability?vanId=<id3>&startDate=...&endDate=...
... one per van ...
```

Fine at 3–4 vans. Not fine at 50. It's also just wasted work — the backend already has to run an overlap query per van; batching it into one call means one query (or one query per van server-side, but one round trip) instead of N HTTP round trips from the client.

## Proposed endpoint

```
GET /vans/available?startDate=<date>&endDate=<date>
```

Same `startDate`/`endDate` semantics as `/reservations/availability` (whole calendar days, `YYYY-MM-DD`, same-day turnover allowed, `endDate` must be after `startDate`, `startDate` not in the past).

**Response `200`** — just the vans that are free for that range, same shape as `GET /vans`:

```json
[
  {
    "id": "fe7911bf-86c6-4ab3-94ac-87d83b1345e5",
    "name": "Compact Camper Van",
    "description": "...",
    "imageUrl": "...",
    "pricePerDay": 89,
    "createdAt": "..."
  }
]
```

- `400` — missing/malformed params, or `endDate <= startDate`, or `startDate` in the past (same validation as `/reservations/availability`).

No new business logic — it's the same "does any reservation for this van overlap this range" check `/reservations/availability` already does, just run across every van in one request and returning the vans instead of a boolean.

## What changes on the frontend once this exists

`src/components/fleet-browser.tsx` currently does:

```ts
const results = await Promise.allSettled(
  vans.map((van) => checkAvailability(van.id, pickupDate, returnDate)),
);
```

That becomes a single call:

```ts
const availableVans = await getAvailableVans(pickupDate, returnDate);
```

No UI changes needed — this is purely a request-count fix.

## Not urgent

Current fleet size (a handful of vans) makes the N-request approach perfectly fine today. This is worth doing before the fleet grows past a dozen or so vans, not before.
