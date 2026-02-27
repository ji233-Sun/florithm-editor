"use client";

import { Plus, Trash2 } from "lucide-react";
import { DynamicFormField } from "../DynamicFormField";
import type { FieldDefinition } from "@/lib/pvz/types";

interface ArrayFieldProps {
  field: FieldDefinition;
  value: unknown[] | null | undefined;
  onChange: (value: unknown[]) => void;
}

export function ArrayField({ field, value, onChange }: ArrayFieldProps) {
  const items = value ?? [];

  function addItem() {
    if (field.itemFields && field.itemFields.length > 0) {
      // Object array: create default item from field defaults
      const newItem: Record<string, unknown> = {};
      for (const f of field.itemFields) {
        newItem[f.key] = f.default ?? null;
      }
      onChange([...items, newItem]);
    } else {
      // Primitive array
      onChange([...items, ""]);
    }
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, newValue: unknown) {
    const updated = [...items];
    updated[index] = newValue;
    onChange(updated);
  }

  const PRIMITIVE_ITEM_TYPES = new Set(["string", "number", "boolean"]);
  const useTypedItem = !!(field.itemType && !PRIMITIVE_ITEM_TYPES.has(field.itemType));

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.label}</span>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={addItem}
        >
          <Plus size={14} />
          添加
        </button>
      </label>
      {field.description && (
        <p className="mb-2 text-xs text-base-content/50">{field.description}</p>
      )}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-base-300 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-base-content/50">
                #{index + 1}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error"
                onClick={() => removeItem(index)}
              >
                <Trash2 size={14} />
              </button>
            </div>
            {field.itemFields && field.itemFields.length > 0 ? (
              // Object array items
              <div className="space-y-3">
                {field.itemFields.map((subField) => (
                  <DynamicFormField
                    key={subField.key}
                    field={subField}
                    value={
                      (item as Record<string, unknown>)?.[subField.key] ??
                      subField.default ??
                      null
                    }
                    onChange={(val) => {
                      const updated = {
                        ...(item as Record<string, unknown>),
                        [subField.key]: val,
                      };
                      updateItem(index, updated);
                    }}
                  />
                ))}
              </div>
            ) : useTypedItem ? (
              // Typed primitive items (e.g., zombie-ref, plant-ref)
              <DynamicFormField
                field={{ key: `${field.key}_${index}`, type: field.itemType!, label: "" }}
                value={item}
                onChange={(val) => updateItem(index, val)}
              />
            ) : (
              // Plain primitive array items
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                value={String(item ?? "")}
                onChange={(e) => updateItem(index, e.target.value)}
              />
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-4 text-center text-sm text-base-content/40">
            暂无数据，点击上方「添加」按钮
          </p>
        )}
      </div>
    </div>
  );
}
