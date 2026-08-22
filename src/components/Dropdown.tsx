"use client";

import { useState, useRef, useEffect } from "react";

export interface DropdownOption {
  label: string;
  value: unknown;
}

interface DropdownProps {
  options: DropdownOption[];
  value: unknown;
  onChange: (value: unknown) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "انتخاب کنید",
  disabled = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative ${disabled ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        className="select select-bordered w-full flex items-center justify-between gap-2 px-3"
        disabled={disabled}
        aria-expanded={open}
        onClick={() => !disabled && setOpen(!open)}
        style={{ backgroundImage: "none" }}
      >
        <span
          className={`truncate text-right ${!selectedOption ? "opacity-70" : ""}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-box border border-base-300 bg-base-100 shadow-lg overflow-auto max-h-60">
          <ul className="menu menu-sm w-full p-1 gap-0.5">
            {options.map((opt) => (
              <li key={String(opt.value)}>
                <button
                  type="button"
                  className={`w-full justify-between text-right transition-colors hover:bg-primary hover:text-primary-content ${
                    opt.value === value ? "menu-active" : ""
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
