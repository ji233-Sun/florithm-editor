"use client";

import { useEffect, useState } from "react";
import { loadModuleConfig, loadEventConfig } from "@/lib/pvz/config-loader";
import { useEditorStore } from "@/stores/editor-store";
import { DynamicForm } from "@/components/ui/DynamicForm";
import type { FieldDefinition } from "@/lib/pvz/types";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface ModuleEditPanelProps {
  objclass: string;
  alias: string;
  isEvent?: boolean;
}

export function ModuleEditPanel({
  objclass,
  alias,
  isEvent,
}: ModuleEditPanelProps) {
  const parsed = useEditorStore((s) => s.parsed);
  const updateModuleData = useEditorStore((s) => s.updateModuleData);
  const updateEventData = useEditorStore((s) => s.updateEventData);

  const [fields, setFields] = useState<FieldDefinition[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFields(null);
    setLoadError(null);

    const load = isEvent ? loadEventConfig : loadModuleConfig;
    load(objclass).then(
      (config) => {
        if (cancelled) return;
        if (config) {
          setFields(config.fields);
        } else {
          setLoadError(`找不到 ${objclass} 的配置`);
        }
      },
      (err) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "加载配置失败");
      }
    );

    return () => {
      cancelled = true;
    };
  }, [objclass, isEvent]);

  const obj = parsed?.objectMap.get(alias);
  if (!obj) return null;

  if (loadError) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-error/5 px-3 py-2 text-sm text-error">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {loadError}
      </div>
    );
  }

  if (!fields) {
    return (
      <div className="flex items-center gap-2 py-6 text-base-content/40">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">加载配置中...</span>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-base-200 px-3 py-3 text-sm text-base-content/50">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        此模块没有可配置的字段。
      </div>
    );
  }

  const data = obj.objdata as Record<string, unknown>;
  const onChange = isEvent ? updateEventData : updateModuleData;

  return (
    <DynamicForm
      fields={fields}
      data={data}
      onChange={(newData) => onChange(alias, newData)}
    />
  );
}
