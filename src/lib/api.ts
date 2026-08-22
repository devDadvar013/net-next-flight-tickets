export const API_BASE_URL =
  "https://laravel-flight-tickets.onrender.com/api/v1";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export interface AirportsResponse {
  data: { code: string; city: string; name: string }[];
}

export interface SearchResponse {
  data: {
    outbound: import("@/types/flight").Flight[];
    return: import("@/types/flight").Flight[] | null;
  };
}

export interface BookingResponse {
  data: import("@/types/flight").Booking & { created_at?: string };
}

export interface PostBookingBody {
  flights: { id: string; price: number }[];
  passengers: import("@/types/flight").Passenger[];
}

export const api = {
  getAirports: () => apiFetch<AirportsResponse>("/airports"),

  searchFlights: (params: {
    from: string;
    to: string;
    date: string;
    cabinClass: string;
  }) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch<SearchResponse>(`/flights/search?${qs}`);
  },

  createBooking: (body: PostBookingBody) =>
    apiFetch<BookingResponse>("/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  getBooking: (ref: string) => apiFetch<BookingResponse>(`/bookings/${ref}`),
};
