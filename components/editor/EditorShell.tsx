"use client";

import { useEffect, useCallback, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { EditorToolbar } from "./EditorToolbar";
import { SettingsTab } from "./tabs/SettingsTab";
import { ModulesTab } from "./tabs/ModulesTab";
import { WavesTab } from "./tabs/WavesTab";
import { VaseBreakerTab } from "./tabs/VaseBreakerTab";
import { IZombieTab } from "./tabs/IZombieTab";
import { ZombossBattleTab } from "./tabs/ZombossBattleTab";
import { JsonViewTab } from "./tabs/JsonViewTab";
import { ChatPanel } from "./chat/ChatPanel";
import type { EditorTab } from "@/stores/editor-store";
import {
  Loader2,
  Settings,
  Package,
  Waves,
  FlaskConical,
  Skull,
  Swords,
  Code2,
  AlertCircle,
} from "lucide-react";

interface EditorShellProps {
  levelId: string;
}

const TAB_ICONS: Record<EditorTab, React.ComponentType<{ className?: string }>> = {
  settings: Settings,
  modules: Package,
  waves: Waves,
  vasebreaker: FlaskConical,
  izombie: Skull,
  zomboss: Swords,
  json: Code2,
};

export function EditorShell({ levelId }: EditorShellProps) {
  const {
    loading,
    error,
    parsed,
    activeTab,
    isDirty,
    autoSaveTimer,
    setActiveTab,
    loadLevel,
    save,
  } = useEditorStore();

  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    loadLevel(levelId);
  }, [levelId, loadLevel]);

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  // Ctrl+S save shortcut
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    },
    [save]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // beforeunload protection
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-base-content/50">加载关卡数据中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-error">
          <AlertCircle className="h-6 w-6" />
          <p className="text-lg font-medium">{error}</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => loadLevel(levelId)}
        >
          重试
        </button>
      </div>
    );
  }

  if (!parsed) return null;

  // Determine which conditional tabs to show
  const hasVaseBreaker = parsed.modules.some(
    (m) => m.objclass === "VaseBreakerPresetProperties"
  );
  const hasIZombie = parsed.modules.some(
    (m) => m.objclass === "EvilDaveProperties"
  );
  const hasZomboss = parsed.modules.some(
    (m) => m.objclass === "ZombossBattleModuleProperties"
  );

  const tabs: { id: EditorTab; label: string; show: boolean }[] = [
    { id: "settings", label: "设置", show: true },
    { id: "modules", label: "模块", show: true },
    { id: "waves", label: "波次", show: true },
    { id: "vasebreaker", label: "砸罐子", show: hasVaseBreaker },
    { id: "izombie", label: "我是僵尸", show: hasIZombie },
    { id: "zomboss", label: "僵王战", show: hasZomboss },
    { id: "json", label: "JSON", show: true },
  ];

  return (
    <div className="flex h-full">
      <div className="flex min-w-0 flex-1 flex-col">
        <EditorToolbar
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen((v) => !v)}
        />

        {/* Tab bar */}
        <div className="border-b border-base-300 bg-base-100">
          <div className="flex gap-0.5 px-4">
            {tabs
              .filter((t) => t.show)
              .map((tab) => {
                const Icon = TAB_ICONS[tab.id];
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-base-content/50 hover:border-base-300 hover:text-base-content/80"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto bg-base-200/50">
          <div className="p-4 md:p-6">
            {activeTab === "settings" && <SettingsTab />}
            {activeTab === "modules" && <ModulesTab />}
            {activeTab === "waves" && <WavesTab />}
            {activeTab === "vasebreaker" && hasVaseBreaker && <VaseBreakerTab />}
            {activeTab === "izombie" && hasIZombie && <IZombieTab />}
            {activeTab === "zomboss" && hasZomboss && <ZombossBattleTab />}
            {activeTab === "json" && <JsonViewTab />}
          </div>
        </div>
      </div>

      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
    </div>
  );
}
