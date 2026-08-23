"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  JalaliDatePicker,
  DatePickerThemeProvider,
} from "@mngh/jalali-datepicker";

interface PersianDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
}

// The library uses role="region" for popover variant, not "dialog"
const CALENDAR_SELECTOR = "[role='region'][aria-label='تقویم شمسی']";

export default function PersianDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "۱۴۰۴/۰۵/۰۱",
}: PersianDatePickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  const positionCalendar = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const input = wrapper.querySelector<HTMLInputElement>("input[type='text']");
    const calendar = wrapper.querySelector<HTMLElement>(CALENDAR_SELECTOR);
    if (!input || !calendar) return;

    const inputRect = input.getBoundingClientRect();
    const calRect = calendar.getBoundingClientRect();
    const calWidth = calRect.width || 320;
    const calHeight = calRect.height || 320;

    // Try above first, fall back to below
    let top = inputRect.top - calHeight - 6;
    if (top < 8) {
      top = inputRect.bottom + 6;
    }
    if (top + calHeight > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - calHeight - 8);
    }

    // RTL: align right edge of calendar with right edge of input
    let left = inputRect.right - calWidth;
    if (left < 8) left = 8;
    if (left + calWidth > window.innerWidth - 8) {
      left = window.innerWidth - calWidth - 8;
    }

    // Apply fixed positioning — this breaks out of any overflow:hidden ancestors
    calendar.style.setProperty("position", "fixed", "important");
    calendar.style.setProperty("top", `${Math.round(top)}px`, "important");
    calendar.style.setProperty("left", `${Math.round(left)}px`, "important");
    calendar.style.setProperty("right", "auto", "important");
    calendar.style.setProperty("bottom", "auto", "important");
    calendar.style.setProperty("z-index", "10000", "important");
  }, []);

  const schedulePosition = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      positionCalendar();
    });
  }, [positionCalendar]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Watch for calendar appearing (the library mounts/unmounts it via React)
    const observer = new MutationObserver(() => {
      const calendar = wrapper.querySelector<HTMLElement>(CALENDAR_SELECTOR);
      if (calendar) {
        schedulePosition();
      }
    });

    observer.observe(wrapper, { childList: true, subtree: true });

    // Re-position on scroll/resize
    const onReposition = () => {
      const calendar = wrapper.querySelector<HTMLElement>(CALENDAR_SELECTOR);
      if (calendar) schedulePosition();
    };

    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [schedulePosition]);

  return (
    <DatePickerThemeProvider mode="light">
      <div ref={wrapperRef} className="jalali-wrapper">
        <JalaliDatePicker
          variant="popover"
          mode="single"
          value={value}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          placeholder={placeholder}
          digitType="persian"
          useMaskedInput
          showHolidays
          showFooter
          allowClear
        />
      </div>
    </DatePickerThemeProvider>
  );
}
