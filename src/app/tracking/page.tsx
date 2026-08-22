"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useBookingStore } from "@/lib/store";
import { Booking } from "@/types/flight";
import TicketView from "@/components/TicketView";

function TrackingContent() {
  const searchParams = useSearchParams();
  const { getBooking } = useBookingStore();

  const [ref, setRef] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Support direct links like /tracking?ref=47ZJWE
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      setRef(refParam);
      // Auto-lookup
      setLoading(true);
      setError(null);
      setSearched(true);
      getBooking(refParam.trim().toUpperCase())
        .then((b) => setBooking(b))
        .catch((e) => {
          setError(
            e?.message?.includes("404")
              ? "رزرو با این کد پیدا نشد. کد را دوباره بررسی کنید."
              : "خطا در ارتباط با سرور. کمی بعد دوباره تلاش کنید."
          );
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, getBooking]);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = ref.trim().toUpperCase();
    if (!trimmed || trimmed.length < 6 || loading) return;

    setLoading(true);
    setError(null);
    setBooking(null);
    setSearched(true);

    try {
      const b = await getBooking(trimmed);
      setBooking(b);
    } catch (e: unknown) {
      const status = (e as { status?: number })?.status;
      setError(
        status === 404
          ? "رزرو با این کد پیدا نشد. کد را دوباره بررسی کنید."
          : "خطا در ارتباط با سرور. کمی بعد دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid = ref.trim().length >= 6;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Lookup form */}
      <div className="card bg-base-100 border border-base-300 shadow-lg max-w-xl mx-auto">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <div>
              <h1 className="text-xl font-extrabold">پیگیری رزرو</h1>
              <p className="text-xs opacity-70">
                با وارد کردن کد رزرو، بلیط‌های خود را مشاهده کنید.
              </p>
            </div>
          </div>

          <form onSubmit={lookup} className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="مثلاً 47ZJWE"
              dir="ltr"
              className="input input-bordered flex-1 font-mono uppercase tracking-widest"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isValid || loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <span>جستجو</span>
              )}
            </button>
          </form>

          <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            کد رزرو شما حداقل ۶ کاراکتر است (مثل{" "}
            <span dir="ltr" className="font-mono">
              47ZJWE
            </span>
            )
          </p>

          {ref.trim().length > 0 && ref.trim().length < 6 && (
            <p className="text-error text-xs mt-1">
              کد رزرو باید حداقل ۶ کاراکتر باشد.
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-error mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ticket */}
      {booking && (
        <div className="mt-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold">بلیط‌های رزرو شده</h2>
            <p className="text-sm opacity-70 mt-1">
              کد رزرو:
              <span
                className="font-mono font-bold text-primary"
                dir="ltr"
              >
                {" "}
                {booking.ref}
              </span>
            </p>
          </div>
          <TicketView booking={booking} />
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">در حال بارگذاری…</div>}>
      <TrackingContent />
    </Suspense>
  );
}
