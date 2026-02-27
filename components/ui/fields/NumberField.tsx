"use client";

import type { FieldDefinition } from "@/lib/pvz/types";

interface NumberFieldProps {
  field: FieldDefinition;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}

export function NumberField({ field, value, onChange }: NumberFieldProps) {
  const isFloat = field.numberType === "float";
  const step = field.step ?? (isFloat ? 0.1 : 1);

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.label}</span>
      </label>
      {field.description && (
        <p className="mb-1 text-xs text-base-content/50">{field.description}</p>
      )}
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="input input-bordered input-sm w-full"
          value={value ?? ""}
          min={field.min}
          max={field.max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "" && field.nullable) {
              onChange(null);
              return;
            }
            const num = isFloat ? parseFloat(raw) : parseInt(raw, 10);
            if (!isNaN(num)) {
              onChange(num);
            }
          }}
        />
        {field.nullable && value !== null && value !== undefined && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => onChange(null)}
            title="设为空"
          >
            清除
          </button>
        )}
      </div>
    </div>
  );
}
