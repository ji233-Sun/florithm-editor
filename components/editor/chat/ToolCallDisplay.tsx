"use client";

import { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const TOOL_NAMES: Record<string, string> = {
  get_level_info: "查询关卡信息",
  list_modules: "列出模块",
  list_waves: "列出波次",
  get_module_detail: "查询模块详情",
  get_event_detail: "查询事件详情",
  list_available_modules: "可用模块列表",
  list_available_events: "可用事件列表",
  check_conflicts: "检查冲突",
  update_level_settings: "修改关卡设置",
  add_module: "添加模块",
  remove_module: "删除模块",
  update_module: "更新模块",
  add_wave: "添加波次",
  remove_wave: "删除波次",
  add_event_to_wave: "添加事件到波次",
  remove_event_from_wave: "删除波次事件",
  update_event: "更新事件",
  list_plants: "搜索植物",
  list_zombies: "搜索僵尸",
};

interface DynamicToolPart {
  type: "dynamic-tool";
  toolName: string;
  toolCallId: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

interface ToolCallDisplayProps {
  part: DynamicToolPart;
}

export function ToolCallDisplay({ part }: ToolCallDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  const { toolName, state, output, errorText } = part;
  const label = TOOL_NAMES[toolName] ?? toolName;

  const isLoading =
    state === "input-streaming" || state === "input-available";
  const isDone = state === "output-available";
  const isError = state === "error";
  const hasActionError =
    isDone &&
    output != null &&
    typeof output === "object" &&
    "error" in (output as Record<string, unknown>)
      ? true
      : false;

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 text-xs">
      <button
        className="flex w-full items-center gap-1.5 px-2 py-1.5"
        onClick={() => (isDone || isError) && setExpanded((v) => !v)}
        disabled={isLoading}
      >
        {/* Status icon */}
        {isLoading && (
          <Loader2 className="h-3 w-3 animate-spin text-info" />
        )}
        {isDone && !hasActionError && (
          <CheckCircle2 className="h-3 w-3 text-success" />
        )}
        {(isError || hasActionError) && (
          <AlertCircle className="h-3 w-3 text-error" />
        )}

        {/* Label */}
        <span className="flex-1 text-left font-medium">{label}</span>

        {/* Expand chevron */}
        {(isDone || isError) &&
          (expanded ? (
            <ChevronDown className="h-3 w-3 text-base-content/40" />
          ) : (
            <ChevronRight className="h-3 w-3 text-base-content/40" />
          ))}
      </button>

      {/* Expanded result */}
      {expanded && (isDone || isError) && (
        <div className="border-t border-base-300 px-2 py-1.5">
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-[11px] text-base-content/70">
            {isError
              ? errorText ?? "执行出错"
              : typeof output === "string"
                ? output
                : JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
