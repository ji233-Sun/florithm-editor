"use client";

import { DynamicFormField } from "./DynamicFormField";
import { PairedArrayField } from "./fields/PairedArrayField";
import { DropConfigField } from "./fields/DropConfigField";
import { RangeField } from "./fields/RangeField";
import type { FieldDefinition } from "@/lib/pvz/types";

/** Field types that receive the full data object instead of a single value */
const COMPOSITE_FIELD_TYPES = new Set(["paired-array", "drop-config", "range"]);

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
      {fields.map((field) => {
        if (COMPOSITE_FIELD_TYPES.has(field.type)) {
          // Composite fields receive the full data object
          switch (field.type) {
            case "paired-array":
              return (
                <PairedArrayField
                  key={field.key}
                  field={field}
                  data={data}
                  onChange={onChange}
                />
              );
            case "drop-config":
              return (
                <DropConfigField
                  key={field.key}
                  field={field}
                  data={data}
                  onChange={onChange}
                />
              );
            case "range":
              return (
                <RangeField
                  key={field.key}
                  field={field}
                  data={data}
                  onChange={onChange}
                />
              );
          }
        }
        return (
          <DynamicFormField
            key={field.key}
            field={field}
            value={data[field.key] ?? field.default ?? null}
            onChange={(value) => handleFieldChange(field.key, value)}
          />
        );
      })}
    </div>
  );
}
