"use client";

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

export default function PersianDatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "۱۴۰۴/۰۵/۰۱",
}: PersianDatePickerProps) {
  return (
    <DatePickerThemeProvider mode="light">
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
        classNames={{
          input: "input input-bordered w-full",
          calendar:
            "z-50 mt-1 rounded-box border border-base-300 bg-base-100 shadow-xl p-3",
          headerTitle: "btn btn-sm btn-ghost font-bold",
          navButton: "btn btn-sm btn-ghost",
          dayCell:
            "btn btn-sm btn-ghost hover:bg-primary hover:text-primary-content",
          selectedCell: "btn btn-sm btn-primary text-primary-content",
          todayCell: "btn btn-sm btn-outline btn-primary font-bold",
          disabledCell: "btn btn-sm btn-ghost opacity-40 cursor-not-allowed",
          holidayCell: "btn btn-sm btn-ghost text-error",
          footerActions: "flex gap-1",
          clearButton: "btn btn-xs btn-ghost",
          confirmButton: "btn btn-xs btn-primary",
          todayButton: "btn btn-xs btn-ghost",
        }}
      />
    </DatePickerThemeProvider>
  );
}
