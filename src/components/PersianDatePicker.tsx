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

const CALENDAR_SELECTOR = "[role='region'][aria-label='تقویم شمسی']";

export default function PersianDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "۱۴۰۴/۰۵/۰۱",
}: PersianDatePickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Track where we moved the calendar so we can clean up
  const movedCalendarRef = useRef<HTMLElement | null>(null);
  const originalParentRef = useRef<HTMLElement | null>(null);
  const originalNextSiblingRef = useRef<Node | null>(null);

  const positionCalendar = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const input = wrapper.querySelector<HTMLInputElement>("input[type='text']");
    const calendar = wrapper.querySelector<HTMLElement>(CALENDAR_SELECTOR);
    if (!input || !calendar) return;

    // If we haven't moved it yet, move to body
    if (calendar.parentElement === wrapper || calendar.parentElement?.closest(".jalali-wrapper")) {
      // Remember where it was so React doesn't crash on unmount
      originalParentRef.current = calendar.parentElement;
      originalNextSiblingRef.current = calendar.nextSibling;

      // Move to body
      document.body.appendChild(calendar);
      movedCalendarRef.current = calendar;
    }

    // Position it
    const inputRect = input.getBoundingClientRect();
    const calRect = calendar.getBoundingClientRect();
    const calWidth = calRect.width || 320;
    const calHeight = calRect.height || 320;

    // Try above first
    let top = inputRect.top - calHeight - 6;
    // If not enough space above, put below
    if (top < 8) {
      top = inputRect.bottom + 6;
    }
    // If still overflows bottom, clamp
    if (top + calHeight > window.innerHeight - 8) {
      top = Math.max(8, window.innerHeight - calHeight - 8);
    }

    // Align right edge of calendar with right edge of input (RTL)
    let left = inputRect.right - calWidth;
    // Keep within viewport
    if (left < 8) left = 8;
    if (left + calWidth > window.innerWidth - 8) {
      left = window.innerWidth - calWidth - 8;
    }

    calendar.style.cssText = `
      position: fixed !important;
      top: ${Math.round(top)}px !important;
      left: ${Math.round(left)}px !important;
      right: auto !important;
      bottom: auto !important;
      z-index: 10000 !important;
      direction: rtl;
      padding: 12px;
      background-color: var(--pdp-surface-bg, #ffffff);
      border-radius: var(--pdp-border-radius, 12px);
      border: 1px solid var(--pdp-surface-border, #e2e8f0);
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3);
      width: max-content;
      user-select: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-sizing: border-box;
    `;
  }, []);

  // Put the calendar back where it was (for React cleanup)
  const restoreCalendar = useCallback(() => {
    const calendar = movedCalendarRef.current;
    const parent = originalParentRef.current;
    const next = originalNextSiblingRef.current;
    if (calendar && parent) {
      try {
        if (next && parent.contains(next)) {
          parent.insertBefore(calendar, next);
        } else {
          parent.appendChild(calendar);
        }
      } catch {
        // DOM might have been cleaned up by React already
      }
      calendar.style.cssText = "";
      movedCalendarRef.current = null;
      originalParentRef.current = null;
      originalNextSiblingRef.current = null;
    }
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let frameId: number | null = null;

    const schedulePosition = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        frameId = null;
        const calendar = wrapper.querySelector<HTMLElement>(CALENDAR_SELECTOR);
        if (calendar) {
          positionCalendar();
        }
      });
    };

    // Watch for calendar appearing/disappearing
    const observer = new MutationObserver(() => {
      const calendar = wrapper.querySelector<HTMLElement>(CALENDAR_SELECTOR);
      if (calendar && calendar.parentElement !== document.body) {
        // Calendar just appeared, position it
        schedulePosition();
      } else if (!calendar && movedCalendarRef.current) {
        // Calendar was removed (closed), clean up ref
        movedCalendarRef.current = null;
        originalParentRef.current = null;
        originalNextSiblingRef.current = null;
      }
    });

    observer.observe(wrapper, { childList: true, subtree: true });

    // Re-position on scroll/resize
    const onReposition = () => {
      const calendar = movedCalendarRef.current;
      if (calendar && document.body.contains(calendar)) {
        schedulePosition();
      }
    };

    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition);
      if (frameId !== null) cancelAnimationFrame(frameId);
      restoreCalendar();
    };
  }, [positionCalendar, restoreCalendar]);

  // When value changes while calendar is open, reposition
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const calendar = wrapper.querySelector<HTMLElement>(CALENDAR_SELECTOR);
    if (calendar && calendar.parentElement === document.body) {
      requestAnimationFrame(() => positionCalendar());
    }
  }, [value, positionCalendar]);

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
