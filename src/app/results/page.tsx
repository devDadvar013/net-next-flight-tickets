"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore, useFlightStore, useBookingStore } from "@/lib/store";
import { Flight, SearchQuery } from "@/types/flight";
import { api } from "@/lib/api";
import { Filters, SortKey, TIME_BUCKETS, applyFilters } from "@/lib/flight-filters";
import { formatPrice, formatShortDate, formatTime } from "@/lib/format";
import { AIRPORTS } from "@/lib/airports";
import FlightCard from "@/components/FlightCard";
import Link from "next/link";

type Step = "outbound" | "return";

export default function ResultsPage() {
  const router = useRouter();
  const query = useSearchStore((s) => s.query);
  const bookingService = useBookingStore();

  const [step, setStep] = useState<Step>("outbound");
  const [loading, setLoading] = useState(true);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filters, setFilters] = useState<Filters>({
    airlines: [],
    stops: [],
    maxPrice: Number.MAX_SAFE_INTEGER,
    timeOfDay: [],
  });
  const [sort, setSort] = useState<SortKey>("cheapest");

  const q = query ?? {
    from: "THR",
    to: "MHD",
    date: "",
    passengers: 1,
    cabinClass: "اکونومی" as const,
    roundTrip: false,
  };

  const fromCity =
    AIRPORTS.find((a) => a.code === q.from)?.city ?? q.from;
  const toCity =
    AIRPORTS.find((a) => a.code === q.to)?.city ?? q.to;

  // Redirect if no query
  useEffect(() => {
    if (!query) {
      router.push("/");
    }
  }, [query, router]);

  // Fetch flights
  useEffect(() => {
    if (!query) return;
    setLoading(true);
    const legQuery =
      step === "outbound"
        ? { from: q.from, to: q.to, date: q.date }
        : { from: q.to, to: q.from, date: q.returnDate! };

    api
      .searchFlights({
        ...legQuery,
        cabinClass: q.cabinClass,
      })
      .then((res) => setFlights(res.data.outbound))
      .catch(() => setFlights([]))
      .finally(() => setLoading(false));
  }, [step, q.from, q.to, q.date, q.returnDate, q.cabinClass, query]);

  // Airlines present in results
  const airlines = useMemo(
    () =>
      [...new Set(flights.map((f) => f.airline))].sort((a, b) =>
        a.localeCompare(b, "fa")
      ),
    [flights]
  );

  // Price cap
  const priceCap = useMemo(
    () => Math.max(0, ...flights.map((f) => f.price)),
    [flights]
  );

  // Reset maxPrice when flights change (keeps it in sync with actual data)
  useEffect(() => {
    if (priceCap > 0) {
      setFilters((f) => {
        // If maxPrice is at 0 (from empty flights) or exceeds new cap, reset it
        if (f.maxPrice === 0 || f.maxPrice > priceCap) {
          return { ...f, maxPrice: priceCap };
        }
        return f;
      });
    }
  }, [priceCap]);

  // Filtered + sorted
  const filtered = useMemo(
    () => applyFilters(flights, filters, sort),
    [flights, filters, sort]
  );

  // Selected outbound flight for round-trip banner
  const selectedOutbound = bookingService.selectedFlights[0];

  // Filter helpers
  const toggleAirline = useCallback((name: string) => {
    setFilters((f) => ({
      ...f,
      airlines: f.airlines.includes(name)
        ? f.airlines.filter((a) => a !== name)
        : [...f.airlines, name],
    }));
  }, []);

  const toggleStops = useCallback((stops: string) => {
    setFilters((f) => ({
      ...f,
      stops: f.stops.includes(stops)
        ? f.stops.filter((s) => s !== stops)
        : [...f.stops, stops],
    }));
  }, []);

  const toggleTime = useCallback((key: string) => {
    setFilters((f) => ({
      ...f,
      timeOfDay: f.timeOfDay.includes(key)
        ? f.timeOfDay.filter((t) => t !== key)
        : [...f.timeOfDay, key],
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      airlines: [],
      stops: [],
      maxPrice: Number.MAX_SAFE_INTEGER,
      timeOfDay: [],
    });
  }, []);

  // Selection flow
  const onSelect = useCallback(
    (flight: Flight) => {
      if (step === "return") {
        bookingService.selectFlight(flight);
        router.push(`/booking/${flight.id}`);
      } else {
        bookingService.selectFlight(flight);
        if (q.roundTrip && q.returnDate) {
          setStep("return");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          router.push(`/booking/${flight.id}`);
        }
      }
    },
    [step, q.roundTrip, q.returnDate, bookingService, router]
  );

  const changeOutbound = useCallback(() => {
    bookingService.resetSelection();
    setStep("outbound");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [bookingService]);

  if (!query) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page heading */}
      <div className="mb-6">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href="/">خانه</Link>
            </li>
            <li className="text-base-content/70">نتایج جستجو</li>
          </ul>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3 flex-wrap">
          {step === "outbound" ? (
            <span className="badge badge-primary badge-lg">بلیت رفت</span>
          ) : (
            <span className="badge badge-secondary badge-lg">بلیت برگشت</span>
          )}
          <span>
            {fromCity} ← {toCity}
          </span>
        </h1>
        <p className="text-sm opacity-70 mt-1">
          {formatShortDate(step === "outbound" ? q.date : q.returnDate!)} ·{" "}
          {q.passengers} مسافر · {q.cabinClass}
        </p>
      </div>

      {/* Round-trip banner */}
      {step === "return" && selectedOutbound && (
        <div className="alert alert-info shadow-lg mb-6 flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 15.5c.3-1.2-.4-2.4-1.6-2.7l-5.2-1.3L9.8 4.5c-.5-.7-1.4-1-2.2-.8l.9 2.5-1.2 1.3-1.8-.5c-.4-.1-.9 0-1.2.3l.5 1.2 1 1.8 4.2 4.2-4.6 1.5-2-1.2c-.5-.3-1.1-.2-1.5.2l.6 1.1 1.3 2.3c.3.6.9.9 1.5.9h.3l3.4-.7 2.6 2.6c.6.6 1.5.8 2.3.5l-1-1.7 1.1-1.4 2 .4c.6.1 1.2-.2 1.5-.7l.4-.9-.6-1.2z" />
            </svg>
            <div>
              <div className="font-bold">بلیت رفت انتخاب شد</div>
              <div className="text-sm opacity-80">
                {selectedOutbound.airline}{" "}
                {selectedOutbound.flightNumber} · {fromCity} ← {toCity} ·{" "}
                <span dir="ltr">{formatTime(selectedOutbound.departure)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-sm btn-ghost" onClick={changeOutbound}>
              تغییر بلیت رفت
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Filters sidebar */}
        <aside className="card bg-base-100 border border-base-300 shadow-sm lg:sticky lg:top-24">
          <div className="card-body gap-5">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-base">فیلترها</h2>
              <button
                className="btn btn-ghost btn-xs"
                onClick={resetFilters}
              >
                حذف فیلترها
              </button>
            </div>

            {/* Price */}
            {priceCap > 0 && (
              <div>
                <div className="label py-0 pb-1">
                  <span className="label-text font-bold text-sm">
                    حداکثر قیمت
                  </span>
                </div>
                <input
                  type="range"
                  className="range range-primary range-xs w-full"
                  min="0"
                  max={priceCap}
                  step="100000"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      maxPrice: Number(e.target.value),
                    }))
                  }
                />
                <div className="flex justify-between text-xs opacity-70 mt-1">
                  <span>۰</span>
                  <span className="font-bold text-primary">
                    {formatPrice(filters.maxPrice)} تومان
                  </span>
                </div>
              </div>
            )}

            {/* Airlines */}
            {airlines.length > 0 && (
              <div>
                <div className="label py-0 pb-2">
                  <span className="label-text font-bold text-sm">ایرلاین</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {airlines.map((name) => (
                    <label
                      key={name}
                      className="label cursor-pointer justify-start gap-2 py-0.5"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-xs"
                        checked={filters.airlines.includes(name)}
                        onChange={() => toggleAirline(name)}
                      />
                      <span className="label-text text-sm">{name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Stops */}
            <div>
              <div className="label py-0 pb-2">
                <span className="label-text font-bold text-sm">توقف</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label cursor-pointer justify-start gap-2 py-0.5">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-xs"
                    checked={filters.stops.includes("0")}
                    onChange={() => toggleStops("0")}
                  />
                  <span className="label-text text-sm">بدون توقف</span>
                </label>
                <label className="label cursor-pointer justify-start gap-2 py-0.5">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary checkbox-xs"
                    checked={filters.stops.includes("1")}
                    onChange={() => toggleStops("1")}
                  />
                  <span className="label-text text-sm">یک توقف</span>
                </label>
              </div>
            </div>

            {/* Time of day */}
            <div>
              <div className="label py-0 pb-2">
                <span className="label-text font-bold text-sm">
                  زمان پرواز
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TIME_BUCKETS.map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    className={`btn btn-xs ${filters.timeOfDay.includes(b.key) ? "btn-primary" : ""}`}
                    onClick={() => toggleTime(b.key)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main>
          {/* Sort + count */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="text-sm opacity-80">
              {loading
                ? "در حال جستجو…"
                : `${filtered.length} پرواز یافت شد`}
            </div>
            <div className="join">
              {(
                [
                  { key: "cheapest", label: "ارزان‌ترین" },
                  { key: "fastest", label: "سریع‌ترین" },
                  { key: "earliest", label: "زودترین" },
                ] as const
              ).map((s) => (
                <button
                  key={s.key}
                  className={`btn btn-sm join-item ${sort === s.key ? "btn-active" : ""}`}
                  onClick={() => setSort(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skeletons */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card bg-base-100 border border-base-300 shadow-sm p-5 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-base-300"></div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-base-300 rounded mb-1.5"></div>
                      <div className="h-3 w-20 bg-base-300 rounded"></div>
                    </div>
                    <div className="h-4 w-24 bg-base-300 rounded"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 w-16 bg-base-300 rounded"></div>
                    <div className="h-4 w-40 bg-base-300 rounded"></div>
                    <div className="h-8 w-16 bg-base-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Flight list */}
          {!loading && (
            <div className="flex flex-col gap-4">
              {filtered.length > 0 ? (
                filtered.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    actionLabel={
                      step === "return" ? "انتخاب برگشت" : "انتخاب رفت"
                    }
                    onSelect={onSelect}
                  />
                ))
              ) : (
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                  <div className="card-body items-center text-center py-12">
                    <div className="text-6xl mb-3">🛫</div>
                    <h3 className="card-title">
                      پروازی با این شرایط پیدا نشد
                    </h3>
                    <p className="text-sm opacity-70 max-w-md">
                      فیلترها را تغییر دهید یا تاریخ دیگری را امتحان کنید.
                    </p>
                    <button
                      className="btn btn-primary btn-sm mt-3"
                      onClick={resetFilters}
                    >
                      حذف فیلترها
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
