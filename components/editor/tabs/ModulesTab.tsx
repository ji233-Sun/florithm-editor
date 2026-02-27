"use client";

import { ModuleList } from "../settings/ModuleList";
import { Package } from "lucide-react";

export function ModulesTab() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">模块管理</h2>
      </div>
      <ModuleList />
    </div>
  );
}
