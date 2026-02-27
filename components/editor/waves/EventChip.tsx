"use client";

import { useEffect, useState } from "react";
import { loadEventConfig } from "@/lib/pvz/config-loader";
import { X } from "lucide-react";

interface EventChipProps {
  objclass: string;
  alias: string;
  onClick: () => void;
  onRemove: () => void;
}

export function EventChip({
  objclass,
  alias,
  onClick,
  onRemove,
}: EventChipProps) {
  const [title, setTitle] = useState(alias);
  const [color, setColor] = useState("#6b7280");

  useEffect(() => {
    loadEventConfig(objclass).then((config) => {
      if (config) {
        setTitle(config.metadata.title);
        setColor(config.metadata.color);
      }
    });
  }, [objclass]);

  return (
    <button
      className="group/chip inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium shadow-sm transition-all hover:shadow-md"
      style={{
        backgroundColor: `${color}10`,
        borderColor: `${color}30`,
        color: color,
      }}
      onClick={onClick}
      title={`${title} (${alias}) — 点击编辑`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {title}
      <span
        className="ml-0.5 rounded p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover/chip:opacity-100"
        role="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-2.5 w-2.5" />
      </span>
    </button>
  );
}
