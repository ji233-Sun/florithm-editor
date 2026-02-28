"use client";

import { NumberField } from "./fields/NumberField";
import { StringField } from "./fields/StringField";
import { BooleanField } from "./fields/BooleanField";
import { SelectField } from "./fields/SelectField";
import { ArrayField } from "./fields/ArrayField";
import { ObjectField } from "./fields/ObjectField";
import { RtidField } from "./fields/RtidField";
import { ZombieRtidField } from "./fields/ZombieRtidField";
import { PlantRtidField } from "./fields/PlantRtidField";
import { GridPositionField } from "./fields/GridPositionField";
import { GridItemSelectField } from "./fields/GridItemSelectField";
import { ZombieSpawnListField } from "./fields/ZombieSpawnListField";
import { JamSelectField } from "./fields/JamSelectField";
import type { FieldDefinition } from "@/lib/pvz/types";

interface DynamicFormFieldProps {
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}

export function DynamicFormField({ field, value, onChange }: DynamicFormFieldProps) {
  switch (field.type) {
    case "number":
      return <NumberField field={field} value={value as number} onChange={onChange} />;
    case "string":
      return <StringField field={field} value={value as string} onChange={onChange} />;
    case "textarea":
      return <StringField field={field} value={value as string} onChange={onChange} textarea />;
    case "boolean":
      return <BooleanField field={field} value={value as boolean} onChange={onChange} />;
    case "select":
      return <SelectField field={field} value={value} onChange={onChange} />;
    case "array":
      return <ArrayField field={field} value={value as unknown[]} onChange={onChange} />;
    case "object":
      return (
        <ObjectField
          field={field}
          value={value as Record<string, unknown>}
          onChange={onChange}
        />
      );
    case "rtid":
      return <RtidField field={field} value={value as string} onChange={onChange} />;
    case "zombie-rtid":
    case "zombie-ref":
      return <ZombieRtidField field={field} value={value as string} onChange={onChange} />;
    case "plant-rtid":
    case "plant-ref":
      return <PlantRtidField field={field} value={value as string} onChange={onChange} />;
    case "plant-select":
      return <PlantRtidField field={field} value={value as string} onChange={onChange} idMode />;
    case "zombie-select":
      return <ZombieRtidField field={field} value={value as string} onChange={onChange} idMode />;
    case "griditem-select":
      return <GridItemSelectField field={field} value={value as string} onChange={onChange} />;
    case "grid-position":
      return (
        <GridPositionField
          field={field}
          value={value as { mX: number; mY: number }}
          onChange={onChange}
        />
      );
    case "zombie-spawn-list":
      return (
        <ZombieSpawnListField
          field={field}
          value={value as { Type: string; Level?: number | null; Row?: number | null }[]}
          onChange={onChange}
        />
      );
    case "jam-select":
      return (
        <JamSelectField
          field={field}
          value={value as string[] | null}
          onChange={onChange}
        />
      );
    case "color":
      return <StringField field={field} value={value as string} onChange={onChange} colorMode />;
    default:
      return (
        <div className="form-control">
          <label className="label">
            <span className="label-text">{field.label}</span>
          </label>
          <div className="text-sm text-base-content/50">
            不支持的字段类型: {field.type}
          </div>
        </div>
      );
  }
}
