"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useToastStore } from "@/store/toastStore";
import { cn } from "./cn";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  className?: string;
  id?: string;
}

export function DatePicker({ value, onChange, className, id }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const toast = useToastStore((s) => s.push);

  // Sync internal inputValue with external value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Today's date helper in local timezone
  const todayStr = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [todayYear, todayMonth] = useMemo(() => {
    const parts = todayStr.split("-").map(Number);
    return [parts[0], parts[1] - 1];
  }, [todayStr]);

  // Calendar navigation month and year
  const [viewMonth, setViewMonth] = useState(todayMonth);
  const [viewYear, setViewYear] = useState(todayYear);

  // Set the calendar view to match the current date value when opened
  useEffect(() => {
    if (isOpen && value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
          setViewYear(y);
          setViewMonth(m);
        }
      }
    }
  }, [isOpen, value]);

  // Handle outside clicks to close calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Escape key to close calendar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Generate Year range (from 1900 to today's year)
  const years = useMemo(() => {
    const result = [];
    for (let y = todayYear; y >= 1900; y--) {
      result.push(y);
    }
    return result;
  }, [todayYear]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper validation logic for manual typing
  const isValidDateFormat = (str: string) => /^\d{4}-\d{2}-\d{2}$/.test(str);
  
  const isValidDate = (str: string) => {
    if (!isValidDateFormat(str)) return false;
    const parts = str.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
    if (month < 0 || month > 11) return false;
    const dateObj = new Date(year, month, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month &&
      dateObj.getDate() === day
    );
  };

  const handleManualInput = (val: string) => {
    setInputValue(val);

    // If fully typed, run validations immediately
    if (val.length === 10) {
      if (isValidDate(val)) {
        if (val > todayStr) {
          toast({
            tone: "danger",
            title: "Invalid date of birth",
            message: "Date of birth cannot be in the future."
          });
          setInputValue("");
          onChange("");
        } else {
          onChange(val);
        }
      } else {
        toast({
          tone: "danger",
          title: "Invalid date",
          message: "Please enter a valid date of birth (YYYY-MM-DD)."
        });
        setInputValue("");
        onChange("");
      }
    }
  };

  const handleBlur = () => {
    if (inputValue && !isValidDate(inputValue)) {
      toast({
        tone: "danger",
        title: "Invalid date",
        message: "Please enter a valid date of birth in YYYY-MM-DD format."
      });
      setInputValue("");
      onChange("");
    } else if (inputValue && inputValue > todayStr) {
      toast({
        tone: "danger",
        title: "Invalid date of birth",
        message: "Date of birth cannot be in the future."
      });
      setInputValue("");
      onChange("");
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    
    const nextMonthStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}`;
    const currentTodayMonthStr = `${todayYear}-${String(todayMonth + 1).padStart(2, "0")}`;

    if (nextMonthStr > currentTodayMonthStr) {
      return; // Cap navigation at current month
    }

    setViewMonth(nextMonth);
    if (viewMonth === 11) {
      setViewYear((prev) => prev + 1);
    }
  };

  const handleYearChange = (year: number) => {
    if (year > todayYear) return;
    
    // Auto-adjust month if the combination results in a future date
    if (year === todayYear && viewMonth > todayMonth) {
      setViewMonth(todayMonth);
    }
    setViewYear(year);
  };

  const handleMonthChange = (month: number) => {
    if (viewYear === todayYear && month > todayMonth) {
      return;
    }
    setViewMonth(month);
  };

  // Generate days grid for current viewMonth and viewYear (padded with prev/next month days)
  const gridCells = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    const cells = [];
    
    // Padding cells from previous month
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        disabled: dateStr > todayStr,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        disabled: dateStr > todayStr,
      });
    }

    // Padding cells from next month to complete 6-row calendar grid (42 cells)
    const totalCells = cells.length;
    const remaining = 42 - totalCells;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        disabled: dateStr > todayStr,
      });
    }

    return cells;
  }, [viewYear, viewMonth, todayStr]);

  const selectDate = (dateStr: string) => {
    if (dateStr > todayStr) {
      toast({
        tone: "danger",
        title: "Invalid date of birth",
        message: "Date of birth cannot be in the future."
      });
      return;
    }
    onChange(dateStr);
    setInputValue(dateStr);
    setIsOpen(false);
  };

  const isNextMonthDisabled = useMemo(() => {
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nextMonthStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}`;
    const currentTodayMonthStr = `${todayYear}-${String(todayMonth + 1).padStart(2, "0")}`;
    return nextMonthStr > currentTodayMonthStr;
  }, [viewMonth, viewYear, todayYear, todayMonth]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => handleManualInput(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => setIsOpen(true)}
          placeholder="YYYY-MM-DD"
          maxLength={10}
          className={cn(
            "mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 pl-4 pr-10 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-primary/50",
            className
          )}
          aria-label="Date of birth in YYYY-MM-DD format"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-3 bottom-3 flex h-6 w-6 items-center justify-center text-white/40 hover:text-white transition cursor-pointer"
          aria-label="Toggle calendar"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div 
          className="absolute left-0 right-0 z-50 mt-2 select-none rounded-2xl border border-white/10 bg-[var(--sf-surface)] p-4 shadow-2xl backdrop-blur-2xl transition-all duration-150 ease-out animate-in fade-in slide-in-from-top-2 w-[320px] max-w-[92vw]"
          style={{ contentVisibility: "auto" }}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-white hover:bg-white/8 transition cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Dropdown */}
              <select
                value={viewMonth}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="bg-transparent text-sm font-semibold text-white outline-none border border-transparent hover:border-white/10 rounded px-1.5 py-0.5 cursor-pointer"
                aria-label="Select month"
              >
                {months.map((m, index) => {
                  const isFuture = viewYear === todayYear && index > todayMonth;
                  return (
                    <option
                      key={m}
                      value={index}
                      disabled={isFuture}
                      className="bg-[var(--sf-surface)] text-white disabled:opacity-40"
                    >
                      {m}
                    </option>
                  );
                })}
              </select>

              {/* Year Dropdown */}
              <select
                value={viewYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="bg-transparent text-sm font-semibold text-white outline-none border border-transparent hover:border-white/10 rounded px-1.5 py-0.5 cursor-pointer"
                aria-label="Select year"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-[var(--sf-surface)] text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-white transition cursor-pointer",
                isNextMonthDisabled
                  ? "opacity-30 cursor-not-allowed pointer-events-none"
                  : "hover:bg-white/8"
              )}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-white/40 mb-2">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {gridCells.map((cell, idx) => {
              const isSelected = value === cell.dateStr;
              const isToday = todayStr === cell.dateStr;
              
              return (
                <button
                  key={`${cell.dateStr}-${idx}`}
                  type="button"
                  onClick={() => selectDate(cell.dateStr)}
                  disabled={cell.disabled}
                  className={cn(
                    "h-8 text-xs font-medium rounded-lg flex items-center justify-center transition focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer",
                    !cell.isCurrentMonth && "text-white/20",
                    cell.isCurrentMonth && !isSelected && !cell.disabled && "text-white/80 hover:bg-white/8",
                    cell.disabled && "opacity-30 cursor-not-allowed pointer-events-none text-white/20",
                    isToday && !isSelected && "border border-primary/40 text-primary font-bold",
                    isSelected && "bg-gradient-to-r from-primary to-highlight text-white font-bold shadow-md shadow-primary/20"
                  )}
                  aria-label={`${isToday ? "Today, " : ""}${cell.dateStr}${isSelected ? ", Selected" : ""}`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
