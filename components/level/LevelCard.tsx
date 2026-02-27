"use client";

import Link from "next/link";
import { Copy, Trash2, Pencil } from "lucide-react";

interface Level {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LevelCardProps {
  level: Level;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function LevelCard({ level, onDelete, onDuplicate }: LevelCardProps) {
  const updatedAt = new Date(level.updatedAt).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="card bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <div className="card-body p-4">
        <h3 className="card-title text-base">{level.name}</h3>
        {level.description && (
          <p className="line-clamp-2 text-sm text-base-content/60">
            {level.description}
          </p>
        )}
        <p className="text-xs text-base-content/40">更新于 {updatedAt}</p>
        <div className="card-actions mt-2 justify-end">
          <Link
            href={`/editor/${level.id}`}
            className="btn btn-primary btn-xs"
          >
            <Pencil size={14} />
            编辑
          </Link>
          <button
            className="btn btn-ghost btn-xs"
            onClick={onDuplicate}
            title="复制"
          >
            <Copy size={14} />
          </button>
          <button
            className="btn btn-ghost btn-xs text-error"
            onClick={onDelete}
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
