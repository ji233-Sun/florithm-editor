"use client";

import type { FieldDefinition } from "@/lib/pvz/types";

interface GridPositionFieldProps {
  field: FieldDefinition;
  value: { mX: number; mY: number } | null | undefined;
  onChange: (value: { mX: number; mY: number }) => void;
}

export function GridPositionField({
  field,
  value,
  onChange,
}: GridPositionFieldProps) {
  const pos = value ?? { mX: 0, mY: 0 };

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.label}</span>
      </label>
      {field.description && (
        <p className="mb-1 text-xs text-base-content/50">{field.description}</p>
      )}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-sm">
          <span className="text-xs text-base-content/50">列</span>
          <input
            type="number"
            className="input input-bordered input-sm w-20"
            value={pos.mX}
            min={0}
            max={9}
            onChange={(e) =>
              onChange({ ...pos, mX: parseInt(e.target.value, 10) || 0 })
            }
          />
        </label>
        <label className="flex items-center gap-1 text-sm">
          <span className="text-xs text-base-content/50">行</span>
          <input
            type="number"
            className="input input-bordered input-sm w-20"
            value={pos.mY}
            min={0}
            max={5}
            onChange={(e) =>
              onChange({ ...pos, mY: parseInt(e.target.value, 10) || 0 })
            }
          />
        </label>
      </div>
    </div>
  );
}
