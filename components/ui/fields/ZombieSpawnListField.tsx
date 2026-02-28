"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, X, Skull, Layers } from "lucide-react";
import type { FieldDefinition } from "@/lib/pvz/types";

// --- Zombie data fetching (shared cache with ZombieRtidField) ---

interface ZombieEntry {
  id: string;
  name: string;
  tags: string[];
  icon: string;
}

interface ZombieSpawnItem {
  Type: string;
  Level?: number | null;
  Row?: number | null;
}

let zombieCache: ZombieEntry[] | null = null;
let zombieFetchPromise: Promise<ZombieEntry[]> | null = null;

function fetchZombies(): Promise<ZombieEntry[]> {
  if (zombieCache) return Promise.resolve(zombieCache);
  if (zombieFetchPromise) return zombieFetchPromise;
  zombieFetchPromise = fetch("/data/reference/Zombies.json")
    .then((res) => res.json())
    .then((data: ZombieEntry[]) => {
      zombieCache = data;
      return data;
    });
  return zombieFetchPromise;
}

function extractId(rtid: string): string {
  const match = rtid.match(/^RTID\(([^@]+)@/);
  return match ? match[1] : rtid;
}

function getZombieImagePath(entry: ZombieEntry): string {
  return `/data/images/zombies/${entry.icon.replace(".webp", ".jpg")}`;
}

// --- Sub-components ---

interface ZombieSpawnListFieldProps {
  field: FieldDefinition;
  value: ZombieSpawnItem[] | null | undefined;
  onChange: (value: ZombieSpawnItem[]) => void;
}

/** The row labels: rows 1-5 + random */
const ROW_LABELS = [
  { row: 1, label: "第 1 行" },
  { row: 2, label: "第 2 行" },
  { row: 3, label: "第 3 行" },
  { row: 4, label: "第 4 行" },
  { row: 5, label: "第 5 行" },
  { row: 0, label: "随机行" },
];

export function ZombieSpawnListField({
  field,
  value,
  onChange,
}: ZombieSpawnListFieldProps) {
  const zombies = useMemo(() => value ?? [], [value]);
  const [allZombies, setAllZombies] = useState<ZombieEntry[]>(
    zombieCache ?? []
  );
  const [addingRow, setAddingRow] = useState<number | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [batchLevel, setBatchLevel] = useState(1);

  useEffect(() => {
    fetchZombies().then(setAllZombies).catch(() => {});
  }, []);

  const zombieMap = useMemo(() => {
    const map = new Map<string, ZombieEntry>();
    for (const z of allZombies) map.set(z.id, z);
    return map;
  }, [allZombies]);

  // Group zombies by row
  const grouped = useMemo(() => {
    const groups = new Map<number, { zombie: ZombieSpawnItem; idx: number }[]>();
    for (const r of ROW_LABELS) groups.set(r.row, []);
    zombies.forEach((z, idx) => {
      const row = z.Row != null && z.Row >= 1 && z.Row <= 5 ? z.Row : 0;
      const group = groups.get(row);
      if (group) group.push({ zombie: z, idx });
    });
    return groups;
  }, [zombies]);

  const handleAdd = useCallback(
    (row: number, zombieId: string) => {
      const newItem: ZombieSpawnItem = {
        Type: `RTID(${zombieId}@ZombieTypes)`,
        Row: row === 0 ? null : row,
      };
      onChange([...zombies, newItem]);
      setAddingRow(null);
    },
    [zombies, onChange]
  );

  const handleRemove = useCallback(
    (idx: number) => {
      onChange(zombies.filter((_, i) => i !== idx));
      if (editingIdx === idx) setEditingIdx(null);
    },
    [zombies, onChange, editingIdx]
  );

  const handleUpdateLevel = useCallback(
    (idx: number, level: number | null) => {
      const updated = [...zombies];
      updated[idx] = { ...updated[idx], Level: level };
      onChange(updated);
    },
    [zombies, onChange]
  );

  const handleBatchLevel = useCallback(() => {
    const updated = zombies.map((z) => ({ ...z, Level: batchLevel }));
    onChange(updated);
  }, [zombies, onChange, batchLevel]);

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{field.label}</span>
        <span className="text-xs text-base-content/40">
          共 {zombies.length} 只
        </span>
      </label>
      {field.description && (
        <p className="mb-2 text-xs text-base-content/50">
          {field.description}
        </p>
      )}

      {/* Row-based lanes */}
      <div className="rounded-lg border border-base-300">
        {ROW_LABELS.map(({ row, label }, i) => {
          const items = grouped.get(row) ?? [];
          return (
            <LaneRow
              key={row}
              label={label}
              row={row}
              items={items}
              zombieMap={zombieMap}
              isAdding={addingRow === row}
              onStartAdd={() => setAddingRow(row)}
              onCancelAdd={() => setAddingRow(null)}
              onAdd={(zombieId) => handleAdd(row, zombieId)}
              onRemove={handleRemove}
              editingIdx={editingIdx}
              onStartEdit={(idx) => setEditingIdx(idx)}
              onCancelEdit={() => setEditingIdx(null)}
              onUpdateLevel={handleUpdateLevel}
              isFirst={i === 0}
              isLast={i === ROW_LABELS.length - 1}
            />
          );
        })}
      </div>

      {/* Batch level setting */}
      {zombies.length > 0 && (
        <div className="mt-3 rounded-lg border border-base-300 bg-base-100 p-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">批量设置等级</span>
            <span className="ml-auto text-sm font-bold text-primary">
              {batchLevel} 阶
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              className="range range-primary range-xs flex-1"
              min={1}
              max={10}
              step={1}
              value={batchLevel}
              onChange={(e) => setBatchLevel(parseInt(e.target.value, 10))}
            />
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={handleBatchLevel}
            >
              一键应用
            </button>
          </div>
          <p className="mt-1 text-[11px] text-base-content/40">
            将本波次所有僵尸设为指定等级
          </p>
        </div>
      )}
    </div>
  );
}

// --- LaneRow ---

interface LaneRowProps {
  label: string;
  row: number;
  items: { zombie: ZombieSpawnItem; idx: number }[];
  zombieMap: Map<string, ZombieEntry>;
  isAdding: boolean;
  onStartAdd: () => void;
  onCancelAdd: () => void;
  onAdd: (zombieId: string) => void;
  onRemove: (idx: number) => void;
  editingIdx: number | null;
  onStartEdit: (idx: number) => void;
  onCancelEdit: () => void;
  onUpdateLevel: (idx: number, level: number | null) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function LaneRow({
  label,
  row,
  items,
  zombieMap,
  isAdding,
  onStartAdd,
  onCancelAdd,
  onAdd,
  onRemove,
  editingIdx,
  onStartEdit,
  onCancelEdit,
  onUpdateLevel,
  isFirst,
  isLast,
}: LaneRowProps) {
  const isRandom = row === 0;

  return (
    <div className={`border-b border-base-200 last:border-b-0 ${isFirst ? "rounded-t-lg" : ""} ${isLast ? "rounded-b-lg" : ""} overflow-visible`}>
      {/* Lane header */}
      <div className={`flex items-center gap-2 bg-base-200/30 px-3 py-1.5 ${isFirst ? "rounded-t-lg" : ""}`}>
        <span
          className={`h-3 w-0.5 rounded-full ${isRandom ? "bg-base-content/30" : "bg-primary"}`}
        />
        <span className="text-xs font-semibold">{label}</span>
        <span className="ml-auto text-[11px] text-base-content/40">
          {items.length} 只
        </span>
      </div>

      {/* Zombie chips + add button */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
        {items.map(({ zombie, idx }) => {
          const id = extractId(zombie.Type);
          const entry = zombieMap.get(id);
          const isEditing = editingIdx === idx;

          return (
            <div key={idx} className="relative">
              <button
                type="button"
                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-1 text-xs transition-all ${
                  isEditing
                    ? "border-primary bg-primary/10"
                    : "border-base-300 bg-base-100 hover:border-base-content/20"
                }`}
                onClick={() =>
                  isEditing ? onCancelEdit() : onStartEdit(idx)
                }
              >
                {entry && (
                  <img
                    src={getZombieImagePath(entry)}
                    alt=""
                    className="h-5 w-5 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <span className="max-w-[80px] truncate">
                  {entry?.name ?? id}
                </span>
                {zombie.Level != null && (
                  <span className="rounded bg-primary/10 px-1 text-[10px] font-semibold text-primary">
                    {zombie.Level}阶
                  </span>
                )}
                <span
                  className="rounded p-0.5 hover:bg-error/10"
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(idx);
                  }}
                >
                  <X className="h-3 w-3 text-base-content/40 hover:text-error" />
                </span>
              </button>

              {/* Inline level editor */}
              {isEditing && (
                <div className="absolute left-0 top-full z-30 mt-1 rounded-lg border border-base-300 bg-base-100 p-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-base-content/50">
                      等级:
                    </span>
                    <input
                      type="number"
                      className="input input-bordered input-xs w-16"
                      min={1}
                      max={10}
                      value={zombie.Level ?? ""}
                      placeholder="无"
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          onUpdateLevel(idx, null);
                        } else {
                          const num = parseInt(raw, 10);
                          if (!isNaN(num)) onUpdateLevel(idx, num);
                        }
                      }}
                    />
                    {zombie.Level != null && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-[11px]"
                        onClick={() => onUpdateLevel(idx, null)}
                      >
                        清除
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add zombie button or inline selector */}
        {isAdding ? (
          <InlineZombieSelector
            zombieMap={zombieMap}
            onSelect={onAdd}
            onCancel={onCancelAdd}
          />
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-0.5 rounded-md border border-dashed border-base-300 px-2 py-1 text-xs text-base-content/40 transition-colors hover:border-primary hover:text-primary"
            onClick={onStartAdd}
          >
            <Plus className="h-3 w-3" />
            添加
          </button>
        )}
      </div>
    </div>
  );
}

// --- Inline Zombie Selector ---

interface InlineZombieSelectorProps {
  zombieMap: Map<string, ZombieEntry>;
  onSelect: (zombieId: string) => void;
  onCancel: () => void;
}

function InlineZombieSelector({
  zombieMap,
  onSelect,
  onCancel,
}: InlineZombieSelectorProps) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allZombies = useMemo(
    () => Array.from(zombieMap.values()),
    [zombieMap]
  );

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const z of allZombies) {
      for (const t of z.tags) tagSet.add(t);
    }
    return Array.from(tagSet).sort();
  }, [allZombies]);

  const filtered = useMemo(() => {
    let list = allZombies;
    if (activeTag) {
      list = list.filter((z) => z.tags.includes(activeTag));
    }
    if (search) {
      const lower = search.toLowerCase();
      list = list.filter(
        (z) =>
          z.id.toLowerCase().includes(lower) ||
          z.name.toLowerCase().includes(lower)
      );
    }
    return list.slice(0, 40);
  }, [allZombies, search, activeTag]);

  return (
    <div className="w-full">
      <div className="mt-1 overflow-hidden rounded-lg border border-primary/30 bg-base-100 shadow-md">
        {/* Search */}
        <div className="flex items-center gap-1 border-b border-base-200 px-2 py-1.5">
          <input
            type="text"
            className="input input-xs flex-1 border-0 bg-transparent focus:outline-none"
            placeholder="搜索僵尸..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-square"
            onClick={onCancel}
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 border-b border-base-200 px-2 py-1">
            <button
              type="button"
              className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                !activeTag
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 text-base-content/50"
              }`}
              onClick={() => setActiveTag(null)}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeTag === tag
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content/50"
                }`}
                onClick={() =>
                  setActiveTag(activeTag === tag ? null : tag)
                }
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="py-4 text-center text-xs text-base-content/40">
              <Skull className="mx-auto mb-1 h-4 w-4" />
              没有匹配的僵尸
            </div>
          ) : (
            filtered.map((z) => (
              <button
                key={z.id}
                type="button"
                className="flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-base-200"
                onClick={() => onSelect(z.id)}
              >
                <img
                  src={getZombieImagePath(z)}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded object-cover bg-base-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{z.name}</div>
                  <div className="truncate font-mono text-[10px] text-base-content/40">
                    {z.id}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
