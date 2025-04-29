import * as React from "react";

interface CalendarProps {
  value?: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ value, onChange, min, max, className }) => {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      min={min}
      max={max}
      className={className}
    />
  );
}; 