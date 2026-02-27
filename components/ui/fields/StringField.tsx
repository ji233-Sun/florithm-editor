"use client";

import type { FieldDefinition } from "@/lib/pvz/types";

interface StringFieldProps {
  field: FieldDefinition;
  value: string | null | undefined;
  onChange: (value: string) => void;
  textarea?: boolean;
  colorMode?: boolean;
}

export function StringField({
  field,
  value,
  onChange,
  textarea,
  colorMode,
}: StringFieldProps) {
  if (colorMode) {
    return (
      <div className="form-control">
        <label className="label">
          <span className="label-text">{field.label}</span>
        </label>
        {field.description && (
          <p className="mb-1 text-xs text-base-content/50">{field.description}</p>
        )}
        <input
          type="color"
          className="input input-bordered input-sm h-10 w-20"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.label}</span>
      </label>
      {field.description && (
        <p className="mb-1 text-xs text-base-content/50">{field.description}</p>
      )}
      {textarea ? (
        <textarea
          className="textarea textarea-bordered textarea-sm w-full"
          value={value ?? ""}
          maxLength={field.maxLength}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          value={value ?? ""}
          maxLength={field.maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
