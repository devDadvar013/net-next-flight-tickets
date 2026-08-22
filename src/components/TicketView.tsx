import { Booking, Flight } from "@/types/flight";
import { formatDate, formatPrice, formatTime } from "@/lib/format";
import { AIRPORTS } from "@/lib/airports";

function city(flight: Flight): string {
  return AIRPORTS.find((a) => a.code === flight.from.code)?.city ?? flight.from.city;
}

function destCity(flight: Flight): string {
  return AIRPORTS.find((a) => a.code === flight.to.code)?.city ?? flight.to.city;
}

export default function TicketView({ booking }: { booking: Booking }) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {booking.flights.map((flight, i) => (
        <div
          key={flight.id}
          className="card bg-base-100 border border-base-300 shadow-lg overflow-hidden"
        >
          {/* Ticket header */}
          <div className="bg-primary text-primary-content px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">{flight.airline}</span>
              <span className="text-sm opacity-80" dir="ltr">
                {flight.flightNumber}
              </span>
            </div>
            <span className="badge badge-outline badge-sm border-white/50 text-white">
              {booking.flights.length > 1
                ? i === 0
                  ? "بلیت رفت"
                  : "بلیت برگشت"
                : "بلیت هواپیما"}
            </span>
          </div>

          <div className="card-body">
            {/* Route */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div>
                <div className="text-3xl font-extrabold" dir="ltr">
                  {formatTime(flight.departure)}
                </div>
                <div className="font-bold">{city(flight)}</div>
                <div className="text-xs opacity-60" dir="ltr">
                  {flight.from.code}
                </div>
              </div>
              <div className="text-center px-2">
                <div className="text-xs opacity-60 mb-1">
                  {formatDate(flight.departure)}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary mx-auto rotate-180"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21.5 15.5c.3-1.2-.4-2.4-1.6-2.7l-5.2-1.3L9.8 4.5c-.5-.7-1.4-1-2.2-.8l.9 2.5-1.2 1.3-1.8-.5c-.4-.1-.9 0-1.2.3l.5 1.2 1 1.8 4.2 4.2-4.6 1.5-2-1.2c-.5-.3-1.1-.2-1.5.2l.6 1.1 1.3 2.3c.3.6.9.9 1.5.9h.3l3.4-.7 2.6 2.6c.6.6 1.5.8 2.3.5l-1-1.7 1.1-1.4 2 .4c.6.1 1.2-.2 1.5-.7l.4-.9-.6-1.2z" />
                </svg>
                <div className="text-xs opacity-60">{flight.cabinClass}</div>
              </div>
              <div className="text-left">
                <div className="text-3xl font-extrabold" dir="ltr">
                  {formatTime(flight.arrival)}
                </div>
                <div className="font-bold">{destCity(flight)}</div>
                <div className="text-xs opacity-60" dir="ltr">
                  {flight.to.code}
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="ticket-dash my-2"></div>
            <div className="text-sm font-bold mb-1">مسافران</div>
            <div className="flex flex-wrap gap-2">
              {booking.passengers.map((p, idx) => (
                <span key={idx} className="badge badge-ghost badge-lg">
                  {p.firstName} {p.lastName}
                  <span className="opacity-60 font-normal text-xs" dir="ltr">
                    {" "}
                    · {p.nationalId}
                  </span>
                </span>
              ))}
            </div>

            {/* Barcode + price */}
            <div className="ticket-dash my-2"></div>
            <div className="flex items-end justify-between gap-4">
              <div
                className="text-primary opacity-80 barcode"
                dir="ltr"
                aria-hidden="true"
              ></div>
              <div className="text-left shrink-0">
                <div className="text-2xl font-extrabold text-primary">
                  {formatPrice(flight.price)}
                </div>
                <div className="text-xs opacity-60">تومان / نفر</div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Total */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body flex-row items-center justify-between">
          <div>
            <div className="text-sm opacity-70">مبلغ کل پرداخت‌شده</div>
            <div className="text-xs opacity-60">
              {booking.passengers.length} مسافر
            </div>
          </div>
          <div className="text-2xl font-extrabold text-primary">
            {formatPrice(booking.total)} تومان
          </div>
        </div>
      </div>

      <p className="text-center text-xs opacity-60 pb-8">
        این بلیط به صورت آزمایشی صادر شده و اعتبار قانونی ندارد.
      </p>
    </div>
  );
}
