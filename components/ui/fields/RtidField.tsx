"use client";

import type { FieldDefinition } from "@/lib/pvz/types";

interface RtidFieldProps {
  field: FieldDefinition;
  value: string | null | undefined;
  onChange: (value: string) => void;
}

export function RtidField({ field, value, onChange }: RtidFieldProps) {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.label}</span>
      </label>
      {field.description && (
        <p className="mb-1 text-xs text-base-content/50">{field.description}</p>
      )}
      <input
        type="text"
        className="input input-bordered input-sm w-full font-mono text-xs"
        value={value ?? ""}
        placeholder="RTID(Alias@Source)"
        onChange={(e) => onChange(e.target.value)}
      />
      {field.rtidSource && (
        <p className="mt-1 text-xs text-base-content/40">
          来源: {field.rtidSource}
        </p>
      )}
    </div>
  );
}
