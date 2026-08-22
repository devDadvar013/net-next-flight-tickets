"use client";

import { useSearchStore } from "@/lib/store";
import { AIRPORTS } from "@/lib/airports";
import { formatShortDate, formatPassengers } from "@/lib/format";
import Link from "next/link";

export default function Header() {
  const query = useSearchStore((s) => s.query);

  const summary = (() => {
    if (!query) return null;
    const from = AIRPORTS.find((a) => a.code === query.from);
    const to = AIRPORTS.find((a) => a.code === query.to);
    return `${from?.city ?? query.from} ← ${to?.city ?? query.to}`;
  })();

  return (
    <header className="sticky top-0 z-40 no-print">
      <div className="navbar bg-primary text-primary-content shadow-md">
        <div className="navbar-start">
          <Link href="/" className="flex items-center gap-2 px-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary-content"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21.5 15.5c.3-1.2-.4-2.4-1.6-2.7l-5.2-1.3L9.8 4.5c-.5-.7-1.4-1-2.2-.8l.9 2.5-1.2 1.3-1.8-.5c-.4-.1-.9 0-1.2.3l.5 1.2 1 1.8 4.2 4.2-4.6 1.5-2-1.2c-.5-.3-1.1-.2-1.5.2l.6 1.1 1.3 2.3c.3.6.9.9 1.5.9h.3l3.4-.7 2.6 2.6c.6.6 1.5.8 2.3.5l-1-1.7 1.1-1.4 2 .4c.6.1 1.2-.2 1.5-.7l.4-.9-.6-1.2z" />
            </svg>
            <span className="text-xl font-extrabold tracking-tight">
              پرواز ۷۲۴
            </span>
          </Link>
        </div>

        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li>
              <Link href="/" className="rounded-btn">
                خانه
              </Link>
            </li>
            {query && (
              <li>
                <Link href="/results" className="rounded-btn">
                  بلیط‌ها
                </Link>
              </li>
            )}
            <li>
              <Link href="/tracking" className="rounded-btn">
                پیگیری رزرو
              </Link>
            </li>
          </ul>
        </div>

        <div className="navbar-end">
          <Link
            href="/"
            className="btn btn-outline btn-sm border-primary-content/40 text-primary-content hover:bg-primary-content hover:text-primary"
          >
            جستجوی پرواز
          </Link>
        </div>
      </div>

      {query && (
        <div className="bg-primary text-primary-content/90 text-sm">
          <div className="container mx-auto px-4 py-1.5 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <span className="opacity-80">جستجوی فعال:</span>
            <span className="font-bold">{summary}</span>
            <span className="opacity-60">•</span>
            <span>{formatShortDate(query.date)}</span>
            {query.roundTrip && query.returnDate && (
              <>
                <span className="opacity-60">تا</span>
                <span>{formatShortDate(query.returnDate)}</span>
              </>
            )}
            <span className="opacity-60">•</span>
            <span>{formatPassengers(query.passengers)}</span>
            <span className="opacity-60">•</span>
            <span>{query.cabinClass}</span>
          </div>
        </div>
      )}
    </header>
  );
}
