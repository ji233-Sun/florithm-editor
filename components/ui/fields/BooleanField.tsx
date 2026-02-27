"use client";

import type { FieldDefinition } from "@/lib/pvz/types";

interface BooleanFieldProps {
  field: FieldDefinition;
  value: boolean | null | undefined;
  onChange: (value: boolean | null) => void;
}

export function BooleanField({ field, value, onChange }: BooleanFieldProps) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          className="toggle toggle-sm toggle-primary"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="label-text">{field.label}</span>
      </label>
      {field.description && (
        <p className="ml-12 text-xs text-base-content/50">{field.description}</p>
      )}
      {field.nullable && value !== null && value !== undefined && (
        <button
          type="button"
          className="btn btn-ghost btn-xs ml-12 w-fit"
          onClick={() => onChange(null)}
        >
          设为空
        </button>
      )}
    </div>
  );
}
