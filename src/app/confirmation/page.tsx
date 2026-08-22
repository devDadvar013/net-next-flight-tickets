"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/lib/store";
import TicketView from "@/components/TicketView";
import Link from "next/link";

export default function ConfirmationPage() {
  const router = useRouter();
  const booking = useBookingStore((s) => s.booking);

  useEffect(() => {
    if (!booking) {
      router.push("/");
    }
  }, [booking, router]);

  if (!booking) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-9 w-9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          رزرو با موفقیت انجام شد 🎉
        </h1>
        <p className="text-sm opacity-70 mt-2">
          کد رزرو شما:
          <span
            className="font-mono font-bold text-primary text-lg"
            dir="ltr"
          >
            {" "}
            {booking.ref}
          </span>
        </p>
        <p className="text-xs opacity-60 mt-1">
          کد رزرو را نزد خود نگه دارید. این کد برای پیگیری و استرداد بلیط لازم
          است.
        </p>
        <div className="mt-4 flex justify-center gap-3 no-print">
          <button
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" rx="1" />
            </svg>
            چاپ بلیط
          </button>
          <Link
            href={`/tracking?ref=${booking.ref}`}
            className="btn btn-outline"
          >
            پیگیری رزرو
          </Link>
          <Link href="/" className="btn btn-outline">
            بازگشت به خانه
          </Link>
        </div>
      </div>

      {/* Tickets */}
      <TicketView booking={booking} />
    </div>
  );
}
