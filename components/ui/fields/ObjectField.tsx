"use client";

import { DynamicFormField } from "../DynamicFormField";
import { PairedArrayField } from "./PairedArrayField";
import type { FieldDefinition } from "@/lib/pvz/types";

interface ObjectFieldProps {
  field: FieldDefinition;
  value: Record<string, unknown> | null | undefined;
  onChange: (value: Record<string, unknown>) => void;
}

export function ObjectField({ field, value, onChange }: ObjectFieldProps) {
  const data = value ?? {};
  const subFields = field.fields ?? [];

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.label}</span>
      </label>
      {field.description && (
        <p className="mb-2 text-xs text-base-content/50">{field.description}</p>
      )}
      <div className="rounded-lg border border-base-300 p-3">
        <div className="space-y-3">
          {subFields.map((subField) =>
            subField.type === "paired-array" ? (
              <PairedArrayField
                key={subField.key}
                field={subField}
                data={data}
                onChange={onChange}
              />
            ) : (
              <DynamicFormField
                key={subField.key}
                field={subField}
                value={data[subField.key] ?? subField.default ?? null}
                onChange={(val) => {
                  onChange({ ...data, [subField.key]: val });
                }}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
