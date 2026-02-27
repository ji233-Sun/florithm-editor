"use client";

import { DynamicFormField } from "./DynamicFormField";
import { PairedArrayField } from "./fields/PairedArrayField";
import type { FieldDefinition } from "@/lib/pvz/types";

interface DynamicFormProps {
  fields: FieldDefinition[];
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

/**
 * Core dynamic form component.
 * Renders form fields based on JSON config definitions.
 * Uses shallow merge strategy: only updates fields declared in config,
 * preserving unknown keys in objdata (matching Z-Editor's JsonSyncManager).
 */
export function DynamicForm({ fields, data, onChange }: DynamicFormProps) {
  function handleFieldChange(key: string, value: unknown) {
    // Shallow merge: only update the specific key, preserve all other keys
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="space-y-4">
      {fields.map((field) =>
        field.type === "paired-array" ? (
          <PairedArrayField
            key={field.key}
            field={field}
            data={data}
            onChange={onChange}
          />
        ) : (
          <DynamicFormField
            key={field.key}
            field={field}
            value={data[field.key] ?? field.default ?? null}
            onChange={(value) => handleFieldChange(field.key, value)}
          />
        )
      )}
    </div>
  );
}
