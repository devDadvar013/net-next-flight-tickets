"use client";

import { Flight } from "@/types/flight";
import { formatDuration, formatPrice, formatTime } from "@/lib/format";

interface FlightCardProps {
  flight: Flight;
  actionLabel?: string;
  badge?: string | null;
  onSelect: (flight: Flight) => void;
}

export default function FlightCard({
  flight,
  actionLabel = "انتخاب",
  badge,
  onSelect,
}: FlightCardProps) {
  const isFull = flight.booked >= flight.capacity;

  return (
    <div className="card card-side bg-base-100 shadow-md border border-base-300 hover:shadow-xl transition-shadow flex-col sm:flex-row">
      <div className="card-body p-4 sm:p-5 gap-3">
        {/* Top row: airline + meta */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm shrink-0"
              style={{ backgroundColor: flight.airlineColor }}
            >
              {flight.airline.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm">{flight.airline}</div>
              <div className="text-xs opacity-60" dir="ltr">
                {flight.flightNumber}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="badge badge-ghost badge-sm">
              {flight.cabinClass}
            </span>
            <span className="badge badge-outline badge-sm">
              {flight.baggage} کیلو بار
            </span>
          </div>
        </div>

        {/* Route row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-center">
            <div className="text-2xl font-extrabold" dir="ltr">
              {formatTime(flight.departure)}
            </div>
            <div className="text-xs opacity-70 mt-0.5">
              {flight.from.city}
            </div>
            <div className="text-[10px] opacity-50" dir="ltr">
              {flight.from.code}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center px-2 min-w-24">
            <div className="text-xs opacity-60 mb-1">
              {formatDuration(flight.departure, flight.arrival)}
            </div>
            <div className="relative w-full flex items-center">
              <div className="h-0.5 bg-base-300 flex-1"></div>
              <div className="mx-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-primary"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21.5 15.5c.3-1.2-.4-2.4-1.6-2.7l-5.2-1.3L9.8 4.5c-.5-.7-1.4-1-2.2-.8l.9 2.5-1.2 1.3-1.8-.5c-.4-.1-.9 0-1.2.3l.5 1.2 1 1.8 4.2 4.2-4.6 1.5-2-1.2c-.5-.3-1.1-.2-1.5.2l.6 1.1 1.3 2.3c.3.6.9.9 1.5.9h.3l3.4-.7 2.6 2.6c.6.6 1.5.8 2.3.5l-1-1.7 1.1-1.4 2 .4c.6.1 1.2-.2 1.5-.7l.4-.9-.6-1.2z" />
                </svg>
              </div>
              <div className="h-0.5 bg-base-300 flex-1"></div>
            </div>
            <div className="text-xs mt-1">
              {flight.stops === 0 ? (
                <span className="badge badge-success badge-sm text-white">
                  مستقیم
                </span>
              ) : (
                <span className="badge badge-warning badge-sm">
                  ۱ توقف
                </span>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-extrabold" dir="ltr">
              {formatTime(flight.arrival)}
            </div>
            <div className="text-xs opacity-70 mt-0.5">{flight.to.city}</div>
            <div className="text-[10px] opacity-50" dir="ltr">
              {flight.to.code}
            </div>
          </div>
        </div>
      </div>

      {/* Price + action */}
      <div className="card-actions justify-between sm:justify-center items-center p-4 sm:p-5 sm:w-48 sm:border-r sm:border-base-300 border-t sm:border-t-0 border-base-300 flex-col sm:flex-col gap-3">
        <div className="text-center">
          <div className="text-xl font-extrabold text-primary">
            {formatPrice(flight.price)}
          </div>
          <div className="text-xs opacity-60">تومان / نفر</div>
        </div>
        <button
          className={`btn btn-primary btn-sm w-full sm:w-auto ${isFull ? "btn-disabled" : ""}`}
          onClick={() => onSelect(flight)}
          disabled={isFull}
        >
          {isFull ? "تکمیل" : actionLabel}
        </button>
      </div>
    </div>
  );
}
