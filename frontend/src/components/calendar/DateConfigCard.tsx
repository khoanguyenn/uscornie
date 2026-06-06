"use client";

import { Input } from "@/components/ui/Input";

interface DateConfigCardProps {
  birthdayDate: string;
  anniversaryDate: string;
  onBirthdayChange: (val: string) => void;
  onAnniversaryChange: (val: string) => void;
}

export function DateConfigCard({
  birthdayDate,
  anniversaryDate,
  onBirthdayChange,
  onAnniversaryChange,
}: DateConfigCardProps) {
  return (
    <div className="card">
      <Input
        id="birthday-input"
        label="Ngày sinh nhật"
        type="date"
        className="max-w-[220px]"
        value={birthdayDate}
        onChange={(e) => onBirthdayChange(e.target.value)}
        aria-label="Ngày sinh nhật"
      />
      <Input
        id="anniversary-input"
        label="Ngày anniversary"
        type="date"
        className="max-w-[220px]"
        value={anniversaryDate}
        onChange={(e) => onAnniversaryChange(e.target.value)}
        aria-label="Ngày kỷ niệm"
      />
    </div>
  );
}
