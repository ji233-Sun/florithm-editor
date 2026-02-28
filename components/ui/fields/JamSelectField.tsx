"use client";

import { Music } from "lucide-react";
import type { FieldDefinition } from "@/lib/pvz/types";

/**
 * JamSelectField — NotificationEvents as a single-select dropdown.
 *
 * Z-Editor maps NotificationEvents to a single jam type:
 * - null → no jam (default)
 * - ["jam_pop"] → Pop
 * - ["jam_rap"] → Rap
 * - ["jam_metal"] → Metal
 * - ["jam_punk"] → Punk
 * - ["jam_8bit"] → 8-Bit
 */

interface JamSelectFieldProps {
  field: FieldDefinition;
  value: string[] | null | undefined;
  onChange: (value: string[] | null) => void;
}

const JAM_OPTIONS: { code: string | null; label: string }[] = [
  { code: null, label: "默认/无 (None)" },
  { code: "jam_pop", label: "流行 (Pop)" },
  { code: "jam_rap", label: "说唱 (Rap)" },
  { code: "jam_metal", label: "重金属 (Metal)" },
  { code: "jam_punk", label: "朋克 (Punk)" },
  { code: "jam_8bit", label: "街机 (8-Bit)" },
];

export function JamSelectField({
  field,
  value,
  onChange,
}: JamSelectFieldProps) {
  const currentCode = Array.isArray(value) ? value[0] ?? null : null;

  function handleChange(code: string | null) {
    onChange(code === null ? null : [code]);
  }

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text flex items-center gap-1.5">
          <Music className="h-3.5 w-3.5 text-primary" />
          {field.label}
        </span>
      </label>
      {field.description && (
        <p className="mb-1.5 text-xs text-base-content/50">
          {field.description}
        </p>
      )}
      <select
        className="select select-bordered select-sm w-full"
        value={currentCode ?? "__none__"}
        onChange={(e) => {
          const val = e.target.value;
          handleChange(val === "__none__" ? null : val);
        }}
      >
        {JAM_OPTIONS.map((opt) => (
          <option key={opt.code ?? "__none__"} value={opt.code ?? "__none__"}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] text-base-content/40">
        此事件触发时切换背景音乐，仅对摇滚年代地图有效
      </p>
    </div>
  );
}
