"use client";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";
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

const VIEWPORT_GAP = 8;
const CALENDAR_GAP = 6;

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
    const calendar = wrapper.querySelector<HTMLElement>("[role='dialog']");
    if (!input || !calendar) return;

    const inputRect = input.getBoundingClientRect();
    const calendarRect = calendar.getBoundingClientRect();
    const calendarWidth = calendarRect.width;
    const calendarHeight = calendarRect.height;

    let top = inputRect.top - calendarHeight - CALENDAR_GAP;
    if (top < VIEWPORT_GAP) {
      top = inputRect.bottom + CALENDAR_GAP;
    }

    if (top + calendarHeight > window.innerHeight - VIEWPORT_GAP) {
      top = Math.max(VIEWPORT_GAP, window.innerHeight - calendarHeight - VIEWPORT_GAP);
    }

    const left = Math.min(
      Math.max(VIEWPORT_GAP, inputRect.right - calendarWidth),
      Math.max(VIEWPORT_GAP, window.innerWidth - calendarWidth - VIEWPORT_GAP),
    );

    calendar.style.setProperty("position", "fixed", "important");
    calendar.style.setProperty("top", `${Math.round(top)}px`, "important");
    calendar.style.setProperty("left", `${Math.round(left)}px`, "important");
    calendar.style.setProperty("right", "auto", "important");
    calendar.style.setProperty("bottom", "auto", "important");
    calendar.style.setProperty("z-index", "10000", "important");
  }, []);

  const schedulePosition = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      positionCalendar();
    });
  }, [positionCalendar]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new MutationObserver(schedulePosition);
    observer.observe(wrapper, { childList: true, subtree: true });

    const handlePointerDown = (event: PointerEvent) => {
      if (wrapper.contains(event.target as Node)) {
        schedulePosition();
      }
    };

    window.addEventListener("resize", schedulePosition);
    window.addEventListener("scroll", schedulePosition, true);
    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedulePosition);
      window.removeEventListener("scroll", schedulePosition, true);
      document.removeEventListener("pointerdown", handlePointerDown, true);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [schedulePosition]);

  useEffect(() => {
    schedulePosition();
  }, [value, schedulePosition]);

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
