"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore, useBookingStore } from "@/lib/store";
import { Passenger } from "@/types/flight";
import { formatPrice, formatPassengers, formatTime } from "@/lib/format";
import { AIRPORTS } from "@/lib/airports";
import Link from "next/link";

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const query = useSearchStore((s) => s.query);
  const { selectedFlights, confirm } = useBookingStore();

  const flights = selectedFlights;
  const q = query ?? {
    from: "THR",
    to: "MHD",
    date: "",
    passengers: 1,
    cabinClass: "اکونومی" as const,
    roundTrip: false,
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [passengers, setPassengers] = useState<Passenger[]>(
    Array.from({ length: q.passengers }, () => ({
      firstName: "",
      lastName: "",
      nationalId: "",
      phone: "",
    }))
  );
  const [touched, setTouched] = useState<boolean[][]>(
    Array.from({ length: q.passengers }, () => [false, false, false, false])
  );

  useEffect(() => {
    if (flights.length === 0) {
      router.push("/");
    }
  }, [flights.length, router]);

  const unitPrice = flights.reduce((sum, f) => sum + f.price, 0);
  const total = unitPrice * passengers.length;

  const legLabel = (flight: (typeof flights)[0]): string => {
    const from =
      AIRPORTS.find((a) => a.code === flight.from.code)?.city ??
      flight.from.city;
    const to =
      AIRPORTS.find((a) => a.code === flight.to.code)?.city ??
      flight.to.city;
    return `${from} ← ${to}`;
  };

  const updatePassenger = (
    i: number,
    field: keyof Passenger,
    value: string
  ) => {
    setPassengers((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p))
    );
  };

  const markTouched = (i: number, field: number) => {
    setTouched((prev) =>
      prev.map((row, idx) =>
        idx === i
          ? row.map((v, fi) => (fi === field ? true : v))
          : row
      )
    );
  };

  const fieldError = (p: Passenger, field: keyof Passenger): string | null => {
    switch (field) {
      case "firstName":
        return p.firstName.length < 2 ? "نام الزامی است (حداقل ۲ حرف)" : null;
      case "lastName":
        return p.lastName.length < 2
          ? "نام خانوادگی الزامی است (حداقل ۲ حرف)"
          : null;
      case "nationalId":
        return !/^\d{10}$/.test(p.nationalId)
          ? "کد ملی باید ۱۰ رقم باشد"
          : null;
      case "phone":
        return !/^09\d{9}$/.test(p.phone)
          ? "شماره موبایل معتبر نیست (09xxxxxxxxx)"
          : null;
    }
  };

  const isFormValid = (): boolean => {
    return passengers.every(
      (p) =>
        p.firstName.length >= 2 &&
        p.lastName.length >= 2 &&
        /^\d{10}$/.test(p.nationalId) &&
        /^09\d{9}$/.test(p.phone)
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || submitting) {
      // Mark all as touched
      setTouched(
        Array.from({ length: passengers.length }, () => [true, true, true, true])
      );
      return;
    }
    setSubmitting(true);
    setSubmitError(false);
    try {
      await confirm(flights, passengers);
      router.push("/confirmation");
    } catch {
      setSubmitting(false);
      setSubmitError(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="breadcrumbs text-sm mb-4">
        <ul>
          <li>
            <Link href="/">خانه</Link>
          </li>
          <li>
            <Link href="/results">نتایج</Link>
          </li>
          <li className="text-base-content/70">تکمیل اطلاعات</li>
        </ul>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
        تکمیل اطلاعات مسافران
      </h1>
      <p className="text-sm opacity-70 mb-6">
        لطفاً مشخصات دقیق {q.passengers} مسافر را وارد کنید. کد ملی برای صدور
        بلیط الزامی است.
      </p>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start"
      >
        {/* Passenger forms */}
        <div className="flex flex-col gap-5">
          {passengers.map((p, i) => (
            <fieldset
              key={i}
              className="card bg-base-100 border border-base-300 shadow-sm"
            >
              <legend className="px-3 ml-4 text-sm font-bold text-primary">
                مسافر {i + 1} از {passengers.length}
              </legend>
              <div className="card-body gap-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* First Name */}
                  <label className="form-control w-full">
                    <div className="label py-0 pb-1">
                      <span className="label-text">نام</span>
                    </div>
                    <input
                      type="text"
                      placeholder="مثلاً علی"
                      className="input input-bordered w-full"
                      value={p.firstName}
                      onChange={(e) =>
                        updatePassenger(i, "firstName", e.target.value)
                      }
                      onBlur={() => markTouched(i, 0)}
                    />
                    {touched[i][0] && fieldError(p, "firstName") && (
                      <div className="label py-0 pt-1">
                        <span className="label-text-alt text-error">
                          {fieldError(p, "firstName")}
                        </span>
                      </div>
                    )}
                  </label>

                  {/* Last Name */}
                  <label className="form-control w-full">
                    <div className="label py-0 pb-1">
                      <span className="label-text">نام خانوادگی</span>
                    </div>
                    <input
                      type="text"
                      placeholder="مثلاً احمدی"
                      className="input input-bordered w-full"
                      value={p.lastName}
                      onChange={(e) =>
                        updatePassenger(i, "lastName", e.target.value)
                      }
                      onBlur={() => markTouched(i, 1)}
                    />
                    {touched[i][1] && fieldError(p, "lastName") && (
                      <div className="label py-0 pt-1">
                        <span className="label-text-alt text-error">
                          {fieldError(p, "lastName")}
                        </span>
                      </div>
                    )}
                  </label>

                  {/* National ID */}
                  <label className="form-control w-full">
                    <div className="label py-0 pb-1">
                      <span className="label-text">کد ملی</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="۱۰ رقم"
                      className="input input-bordered w-full"
                      value={p.nationalId}
                      onChange={(e) =>
                        updatePassenger(i, "nationalId", e.target.value)
                      }
                      onBlur={() => markTouched(i, 2)}
                    />
                    {touched[i][2] && fieldError(p, "nationalId") && (
                      <div className="label py-0 pt-1">
                        <span className="label-text-alt text-error">
                          {fieldError(p, "nationalId")}
                        </span>
                      </div>
                    )}
                  </label>

                  {/* Phone */}
                  <label className="form-control w-full">
                    <div className="label py-0 pb-1">
                      <span className="label-text">شماره موبایل</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="0912xxxxxxx"
                      className="input input-bordered w-full"
                      value={p.phone}
                      onChange={(e) =>
                        updatePassenger(i, "phone", e.target.value)
                      }
                      onBlur={() => markTouched(i, 3)}
                    />
                    {touched[i][3] && fieldError(p, "phone") && (
                      <div className="label py-0 pt-1">
                        <span className="label-text-alt text-error">
                          {fieldError(p, "phone")}
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </fieldset>
          ))}
        </div>

        {/* Summary sidebar */}
        <aside className="card bg-base-100 border border-base-300 shadow-sm lg:sticky lg:top-24">
          <div className="card-body gap-4">
            <h2 className="card-title text-base">خلاصه سفر</h2>

            <div className="flex flex-col gap-3">
              {flights.map((flight, i) => (
                <div
                  key={flight.id}
                  className="rounded-box bg-base-200 p-3"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="badge badge-primary badge-sm">
                      {flights.length > 1
                        ? i === 0
                          ? "رفت"
                          : "برگشت"
                        : "بلیت"}
                    </span>
                    <span className="opacity-60" dir="ltr">
                      {flight.flightNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold mt-2">
                    <span dir="ltr">{formatTime(flight.departure)}</span>
                    <span className="text-xs opacity-60">
                      {legLabel(flight)}
                    </span>
                    <span dir="ltr">{formatTime(flight.arrival)}</span>
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    {flight.airline} · {flight.cabinClass}
                  </div>
                </div>
              ))}
            </div>

            <div className="ticket-dash"></div>

            <div className="flex justify-between text-sm">
              <span>قیمت هر نفر</span>
              <span>{formatPrice(unitPrice)} تومان</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>تعداد مسافر</span>
              <span>{formatPassengers(q.passengers)}</span>
            </div>

            <div className="ticket-dash"></div>

            <div className="flex justify-between items-center">
              <span className="font-bold">مبلغ قابل پرداخت</span>
              <span className="text-xl font-extrabold text-primary">
                {formatPrice(total)} تومان
              </span>
            </div>

            {submitError && (
              <div className="alert alert-error text-sm py-2">
                <span>
                  ثبت رزرو با خطا مواجه شد. لطفاً دوباره تلاش کنید.
                </span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={submitting}
            >
              {submitting ? "در حال ثبت رزرو…" : "پرداخت و صدور بلیط"}
            </button>
            <p className="text-[11px] opacity-60 text-center leading-5">
              این یک نمونه‌ی نمایشی است؛ هیچ مبلغی واقعاً از حساب شما کسر
              نمی‌شود.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
