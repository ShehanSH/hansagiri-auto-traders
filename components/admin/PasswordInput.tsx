"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Field";

export function PasswordInput({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} label={label} hint={hint} type={visible ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        className="absolute top-[2.35rem] right-3 text-muted hover:text-gold"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
