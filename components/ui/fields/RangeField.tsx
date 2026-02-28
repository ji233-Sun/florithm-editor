"use client";

import { SlidersHorizontal } from "lucide-react";
import type { FieldDefinition } from "@/lib/pvz/types";

interface RangeFieldProps {
  field: FieldDefinition;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

/**
 * RangeField — generic composite field for a start/end numeric pair.
 *
 * Config-driven via FieldDefinition:
 *   startKey / endKey     — data keys (required)
 *   startLabel / endLabel — input labels (optional, defaults to startKey/endKey)
 *   min / max / step      — shared numeric constraints
 *   label                 — card title
 *   description           — help text below inputs
 */
export function RangeField({ field, data, onChange }: RangeFieldProps) {
  const startKey = field.startKey ?? "Start";
  const endKey = field.endKey ?? "End";
  const startLabel = field.startLabel ?? startKey;
  const endLabel = field.endLabel ?? endKey;
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step = field.step ?? 1;
  const isFloat = field.numberType === "float";

  const startVal = (data[startKey] as number | undefined) ?? min;
  const endVal = (data[endKey] as number | undefined) ?? max;

  const parse = (raw: string) => (isFloat ? parseFloat(raw) : parseInt(raw, 10));

  return (
    <div className="form-control">
      <div className="rounded-lg border border-base-300 bg-base-100 p-4">
        <div className="mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary">
            {field.label}
          </span>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-base-content/70">
              {startLabel}
            </label>
            <input
              type="number"
              className="input input-bordered input-sm w-full"
              min={min}
              max={max}
              step={step}
              value={startVal}
              onChange={(e) => {
                const num = parse(e.target.value);
                if (!isNaN(num)) onChange({ ...data, [startKey]: num });
              }}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-base-content/70">
              {endLabel}
            </label>
            <input
              type="number"
              className="input input-bordered input-sm w-full"
              min={min}
              max={max}
              step={step}
              value={endVal}
              onChange={(e) => {
                const num = parse(e.target.value);
                if (!isNaN(num)) onChange({ ...data, [endKey]: num });
              }}
            />
          </div>
        </div>
        {startVal >= endVal && (
          <p className="mt-2 text-[11px] text-warning">
            {startLabel}应小于{endLabel}
          </p>
        )}
        {field.description && (
          <p className="mt-2 text-[11px] text-base-content/40">
            {field.description}
          </p>
        )}
      </div>
    </div>
  );
}
