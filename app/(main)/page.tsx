"use client";

import { useEffect, useState, useCallback } from "react";
import { LevelList } from "@/components/level/LevelList";
import { CreateLevelDialog } from "@/components/level/CreateLevelDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus, RefreshCw } from "lucide-react";

interface Level {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingLevelId, setDeletingLevelId] = useState<string | null>(null);

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/levels");
      if (res.ok) {
        const data = await res.json();
        setLevels(data.levels);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  async function deleteLevel(id: string) {
    const res = await fetch(`/api/levels/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLevels((prev) => prev.filter((l) => l.id !== id));
    }
  }

  async function handleDelete(id: string) {
    setDeletingLevelId(id);
  }

  async function handleDuplicate(id: string) {
    const res = await fetch(`/api/levels/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      fetchLevels();
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的关卡</h1>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={fetchLevels}>
            <RefreshCw size={16} />
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} />
            新建关卡
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <LevelList
          levels={levels}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      )}

      {showCreate && (
        <CreateLevelDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchLevels();
          }}
        />
      )}

      <ConfirmDialog
        open={deletingLevelId !== null}
        title="删除关卡"
        message="确定删除此关卡？"
        confirmText="删除"
        cancelText="取消"
        danger
        onCancel={() => setDeletingLevelId(null)}
        onConfirm={async () => {
          if (deletingLevelId) {
            await deleteLevel(deletingLevelId);
          }
          setDeletingLevelId(null);
        }}
      />
    </>
  );
}
