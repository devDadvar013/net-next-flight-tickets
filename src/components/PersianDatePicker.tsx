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
      <div className="jalali-wrapper">
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
