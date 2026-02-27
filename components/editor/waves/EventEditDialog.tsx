"use client";

import { ModuleEditPanel } from "../shared/ModuleEditPanel";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { loadEventConfig } from "@/lib/pvz/config-loader";

interface EventEditDialogProps {
  alias: string;
  objclass: string;
  onClose: () => void;
}

export function EventEditDialog({
  alias,
  objclass,
  onClose,
}: EventEditDialogProps) {
  const [title, setTitle] = useState(objclass);
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
    <div className="modal modal-open" onClick={(e) => e.stopPropagation()}>
      <div className="modal-box max-w-2xl p-0">
        {/* Header with color accent */}
        <div className="flex items-center gap-3 border-b border-base-300 px-5 py-3">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1">
            <h3 className="text-base font-bold">{title}</h3>
            <span className="font-mono text-xs text-base-content/30">
              {alias}
            </span>
          </div>
          <button
            className="btn btn-ghost btn-sm btn-square rounded-lg"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <ModuleEditPanel objclass={objclass} alias={alias} isEvent />
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
