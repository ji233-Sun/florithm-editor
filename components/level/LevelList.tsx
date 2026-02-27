"use client";

import { LevelCard } from "./LevelCard";

interface Level {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LevelListProps {
  levels: Level[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function LevelList({ levels, onDelete, onDuplicate }: LevelListProps) {
  if (levels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/60">
        <p className="text-lg">还没有关卡</p>
        <p className="text-sm">点击「新建关卡」开始创作</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {levels.map((level) => (
        <LevelCard
          key={level.id}
          level={level}
          onDelete={() => onDelete(level.id)}
          onDuplicate={() => onDuplicate(level.id)}
        />
      ))}
    </div>
  );
}
