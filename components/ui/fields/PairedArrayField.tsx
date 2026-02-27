"use client";

import { Plus, Trash2 } from "lucide-react";
import { DynamicFormField } from "../DynamicFormField";
import type { FieldDefinition } from "@/lib/pvz/types";

interface PairedArrayFieldProps {
  field: FieldDefinition;
  /** The parent object containing all sibling arrays */
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

/**
 * Edits multiple sibling arrays that are index-aligned as a single paired list.
 *
 * Example: ZombiePool[] + ZombieLevel[] → each row shows (zombie, level).
 *
 * Config shape:
 * ```json
 * {
 *   "key": "_zombiePoolPaired",
 *   "type": "paired-array",
 *   "label": "僵尸池",
 *   "pairedKeys": [
 *     { "key": "ZombiePool",  "field": { "key": "ZombiePool",  "type": "zombie-ref", "label": "僵尸" } },
 *     { "key": "ZombieLevel", "field": { "key": "ZombieLevel", "type": "number", "label": "等级", "numberType": "int" } }
 *   ]
 * }
 * ```
 *
 * The component reads/writes each `pairedKeys[].key` array on the parent data object,
 * keeping them length-synchronized.
 */
export function PairedArrayField({
  field,
  data,
  onChange,
}: PairedArrayFieldProps) {
  const pairs = field.pairedKeys ?? [];
  if (pairs.length === 0) return null;

  // Determine row count from the longest array
  const arrays = pairs.map((p) => {
    const arr = data[p.key];
    return Array.isArray(arr) ? arr : [];
  });
  const rowCount = Math.max(0, ...arrays.map((a) => a.length));

  function emitChange(newArrays: unknown[][]) {
    const patch: Record<string, unknown> = {};
    pairs.forEach((p, i) => {
      patch[p.key] = newArrays[i];
    });
    onChange({ ...data, ...patch });
  }

  function addRow() {
    const newArrays = arrays.map((arr, i) => {
      const def = pairs[i].field.default;
      return [...arr, def ?? (pairs[i].field.type === "number" ? 0 : "")];
    });
    emitChange(newArrays);
  }

  function removeRow(rowIdx: number) {
    const newArrays = arrays.map((arr) =>
      arr.filter((_, i) => i !== rowIdx)
    );
    emitChange(newArrays);
  }

  function updateCell(rowIdx: number, pairIdx: number, value: unknown) {
    const newArrays = arrays.map((arr) => [...arr]);
    // Ensure array is long enough
    while (newArrays[pairIdx].length <= rowIdx) {
      const def = pairs[pairIdx].field.default;
      newArrays[pairIdx].push(
        def ?? (pairs[pairIdx].field.type === "number" ? 0 : "")
      );
    }
    newArrays[pairIdx][rowIdx] = value;
    emitChange(newArrays);
  }

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.label}</span>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={addRow}
        >
          <Plus size={14} />
          添加
        </button>
      </label>
      {field.description && (
        <p className="mb-2 text-xs text-base-content/50">
          {field.description}
        </p>
      )}

      <div className="space-y-2">
        {Array.from({ length: rowCount }, (_, rowIdx) => (
          <div
            key={rowIdx}
            className="rounded-lg border border-base-300 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-base-content/50">
                #{rowIdx + 1}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error"
                onClick={() => removeRow(rowIdx)}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {pairs.map((pair, pairIdx) => (
                <DynamicFormField
                  key={pair.key}
                  field={pair.field}
                  value={arrays[pairIdx]?.[rowIdx] ?? pair.field.default ?? null}
                  onChange={(val) => updateCell(rowIdx, pairIdx, val)}
                />
              ))}
            </div>
          </div>
        ))}
        {rowCount === 0 && (
          <p className="py-4 text-center text-sm text-base-content/40">
            暂无数据，点击上方「添加」按钮
          </p>
        )}
      </div>
    </div>
  );
}
