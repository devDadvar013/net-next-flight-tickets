import { create } from "zustand";
import { Flight, Passenger, Booking, SearchQuery } from "@/types/flight";
import { AIRPORTS } from "@/lib/airports";
import { api } from "@/lib/api";

interface FlightState {
  airports: typeof AIRPORTS;
  fetchAirports: () => Promise<void>;
}

export const useFlightStore = create<FlightState>((set) => ({
  airports: AIRPORTS,
  fetchAirports: async () => {
    try {
      const res = await api.getAirports();
      const merged = [...AIRPORTS];
      for (const a of res.data) {
        if (!merged.some((m) => m.code === a.code)) merged.push(a);
      }
      set({ airports: merged });
    } catch {
      // keep bundled list on failure
    }
  },
}));

interface SearchState {
  query: SearchQuery | null;
  setQuery: (q: SearchQuery) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: null,
  setQuery: (q) => set({ query: { ...q } }),
}));

interface BookingState {
  selectedFlights: Flight[];
  booking: Booking | null;
  selectFlight: (flight: Flight) => void;
  resetSelection: () => void;
  confirm: (
    flights: Flight[],
    passengers: Passenger[]
  ) => Promise<Booking>;
  getBooking: (ref: string) => Promise<Booking>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedFlights: [],
  booking: null,
  selectFlight: (flight) => {
    const current = get().selectedFlights;
    if (current.some((f) => f.id === flight.id)) return;
    set({ selectedFlights: [...current, flight] });
  },
  resetSelection: () => set({ selectedFlights: [] }),
  confirm: async (flights, passengers) => {
    const body = {
      flights: flights.map((f) => ({ id: f.id, price: f.price })),
      passengers: passengers.map((p) => ({ ...p })),
    };
    const res = await api.createBooking(body);
    const booking: Booking = {
      ref: res.data.ref,
      flights,
      passengers,
      total: res.data.total,
      createdAt: res.data.createdAt ?? new Date().toISOString(),
    };
    set({ booking, selectedFlights: [] });
    return booking;
  },
  getBooking: async (ref) => {
    const res = await api.getBooking(ref);
    const b = res.data;
    return {
      ...b,
      createdAt: b.createdAt ?? b.created_at ?? new Date().toISOString(),
    };
  },
}));
