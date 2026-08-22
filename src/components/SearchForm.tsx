"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore, useFlightStore } from "@/lib/store";
import { CabinClass, SearchQuery } from "@/types/flight";
import Dropdown, { DropdownOption } from "./Dropdown";
import PersianDatePicker from "./PersianDatePicker";

function dateToIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function isoToDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

export default function SearchForm({
  onQuickDestination,
}: {
  onQuickDestination?: (code: string) => void;
}) {
  const router = useRouter();
  const setQuery = useSearchStore((s) => s.setQuery);
  const prevQuery = useSearchStore((s) => s.query);
  const airports = useFlightStore((s) => s.airports);
  const fetchAirports = useFlightStore((s) => s.fetchAirports);

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);

  const airportOptions: DropdownOption[] = airports.map((a) => ({
    label: `${a.city} — ${a.name}`,
    value: a.code,
  }));

  const passengerOptions: DropdownOption[] = Array.from({ length: 9 }, (_, i) => ({
    label: `${i + 1} نفر`,
    value: i + 1,
  }));

  const cabinOptions: DropdownOption[] = [
    { label: "اکونومی", value: "اکونومی" },
    { label: "بیزینس", value: "بیزینس" },
  ];

  const [tripType, setTripType] = useState<"roundtrip" | "oneway">(
    prevQuery?.roundTrip ? "roundtrip" : "roundtrip"
  );
  const [from, setFrom] = useState(prevQuery?.from ?? "THR");
  const [to, setTo] = useState(prevQuery?.to ?? "MHD");
  const [departureDate, setDepartureDate] = useState<Date | null>(
    isoToDate(prevQuery?.date) ?? tomorrow
  );
  const [returnDateValue, setReturnDateValue] = useState<Date | null>(
    isoToDate(prevQuery?.returnDate) ?? dayAfter
  );
  const [passengers, setPassengers] = useState(prevQuery?.passengers ?? 1);
  const [cabinClass, setCabinClass] = useState<CabinClass>(prevQuery?.cabinClass ?? "اکونومی");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchAirports();
  }, [fetchAirports]);

  const swapCities = () => {
    setFrom(to);
    setTo(from);
    setSubmitted(false);
  };

  const date = departureDate ? dateToIso(departureDate) : "";
  const returnDate = returnDateValue ? dateToIso(returnDateValue) : "";

  const sameCities = from === to;
  const returnDateMissing = tripType === "roundtrip" && !returnDate;
  const isValid = from && to && date && passengers >= 1 && passengers <= 9 && !sameCities && !returnDateMissing;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setSubmitted(true);
      return;
    }
    setSubmitted(false);
    const query: SearchQuery = {
      from,
      to,
      date,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      passengers: Number(passengers),
      cabinClass: cabinClass as CabinClass,
      roundTrip: tripType === "roundtrip",
    };
    setQuery(query);
    router.push("/results");
  };

  const showError = submitted && !isValid;

  return (
    <form onSubmit={submit} className="card bg-base-100 text-base-content shadow-xl border border-base-300">
      <div className="card-body gap-4 p-5 sm:p-6">
        {/* Trip type */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="join">
            <input
              type="radio"
              className="btn btn-sm join-item"
              name="tripType"
              value="roundtrip"
              checked={tripType === "roundtrip"}
              onChange={() => setTripType("roundtrip")}
              aria-label="رفت و برگشت"
            />
            <input
              type="radio"
              className="btn btn-sm join-item"
              name="tripType"
              value="oneway"
              checked={tripType === "oneway"}
              onChange={() => setTripType("oneway")}
              aria-label="یک‌طرفه"
            />
          </div>
          <label className="label cursor-pointer gap-2 text-sm">
            <span>کابین:</span>
            <div className="w-32">
              <Dropdown
                options={cabinOptions}
                value={cabinClass}
                onChange={(v) => setCabinClass(v as CabinClass)}
              />
            </div>
          </label>
        </div>

        {/* Route */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <label className="form-control w-full">
            <div className="label py-0 pb-1">
              <span className="label-text text-sm">مبدا</span>
            </div>
            <Dropdown
              options={airportOptions}
              value={from}
              onChange={(v) => setFrom(v as string)}
              placeholder="مبدا را انتخاب کنید"
            />
          </label>

          <button
            type="button"
            className="btn btn-circle btn-outline btn-primary self-center"
            onClick={swapCities}
            title="جابه‌جایی مبدا و مقصد"
            aria-label="جابه‌جایی مبدا و مقصد"
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
              <path d="M8 3 4 7l4 4" />
              <path d="M4 7h16" />
              <path d="m16 21 4-4-4-4" />
              <path d="M20 17H4" />
            </svg>
          </button>

          <label className="form-control w-full">
            <div className="label py-0 pb-1">
              <span className="label-text text-sm">مقصد</span>
            </div>
            <Dropdown
              options={airportOptions}
              value={to}
              onChange={(v) => setTo(v as string)}
              placeholder="مقصد را انتخاب کنید"
            />
          </label>
        </div>

        {/* Dates + passengers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-control w-full">
            <div className="label py-0 pb-1">
              <span className="label-text text-sm">تاریخ رفت</span>
            </div>
            <PersianDatePicker
              value={departureDate}
              onChange={setDepartureDate}
              minDate={today}
              placeholder="تاریخ رفت"
            />
          </div>

          {tripType === "roundtrip" && (
            <div className="form-control w-full">
              <div className="label py-0 pb-1">
                <span className="label-text text-sm">تاریخ برگشت</span>
              </div>
              <PersianDatePicker
                value={returnDateValue}
                onChange={setReturnDateValue}
                minDate={today}
                placeholder="تاریخ برگشت"
              />
            </div>
          )}

          <div
            className={`form-control w-full ${tripType !== "roundtrip" ? "sm:col-span-2" : ""}`}
          >
            <div className="label py-0 pb-1">
              <span className="label-text text-sm">تعداد مسافر</span>
            </div>
            <Dropdown
              options={passengerOptions}
              value={passengers}
              onChange={(v) => setPassengers(v as number)}
              placeholder="تعداد مسافر"
            />
          </div>
        </div>

        {/* Validation feedback */}
        {showError && (
          <div role="alert" className="alert alert-error text-sm">
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
            <span>
              {sameCities && "مبدا و مقصد نمی‌توانند یکسان باشند."}
              {returnDateMissing &&
                "برای سفر رفت و برگشت، تاریخ برگشت را انتخاب کنید."}
              {!sameCities &&
                !returnDateMissing &&
                "لطفاً همه‌ی فیلدهای لازم را کامل کنید."}
            </span>
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="btn btn-primary btn-lg w-full text-lg">
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          جستجوی پرواز
        </button>
      </div>
    </form>
  );
}
