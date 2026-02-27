"use client";

import { useMemo } from "react";
import type { FieldDefinition } from "@/lib/pvz/types";

interface SelectFieldProps {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: string | number) => void;
}

/** Normalize options: support both plain strings and { value, label } objects */
function normalizeOptions(
  raw: FieldDefinition["options"]
): { value: string | number; label: string }[] {
  if (!raw) return [];
  return raw.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { value: opt, label: String(opt) };
    }
    return opt;
  });
}

export function SelectField({ field, value, onChange }: SelectFieldProps) {
  const options = useMemo(() => normalizeOptions(field.options), [field.options]);

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.label}</span>
      </label>
      {field.description && (
        <p className="mb-1 text-xs text-base-content/50">{field.description}</p>
      )}
      <select
        className="select select-bordered select-sm w-full"
        value={String(value ?? "")}
        onChange={(e) => {
          const opt = options.find((o) => String(o.value) === e.target.value);
          onChange(opt?.value ?? e.target.value);
        }}
      >
        <option value="" disabled>
          请选择...
        </option>
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
