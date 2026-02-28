"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Leaf, X, Plus, Droplets, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { FieldDefinition } from "@/lib/pvz/types";

/**
 * DropConfigField — composite field managing AdditionalPlantfood + SpawnPlantName.
 *
 * Drop logic (from Z-Editor):
 * - When SpawnPlantName.length == AdditionalPlantfood && SpawnPlantName.isNotEmpty()
 *   → Plant drop mode: zombies drop plant cards from the list
 * - When AdditionalPlantfood > 0 but SpawnPlantName is empty/size != count
 *   → Plantfood mode: zombies carry energy beans (能量豆)
 * - When AdditionalPlantfood is null/0
 *   → No drops
 */

interface DropConfigFieldProps {
  field: FieldDefinition;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

interface PlantEntry {
  id: string;
  name: string;
  tags: string[];
  icon: string;
}

let plantCache: PlantEntry[] | null = null;
let plantFetchPromise: Promise<PlantEntry[]> | null = null;

function fetchPlants(): Promise<PlantEntry[]> {
  if (plantCache) return Promise.resolve(plantCache);
  if (plantFetchPromise) return plantFetchPromise;
  plantFetchPromise = fetch("/data/reference/Plants.json")
    .then((res) => res.json())
    .then((data: PlantEntry[]) => {
      plantCache = data;
      return data;
    });
  return plantFetchPromise;
}

function getPlantImagePath(entry: PlantEntry): string {
  return `/data/images/plants/${entry.icon.replace(".webp", ".jpg")}`;
}

export function DropConfigField({
  field,
  data,
  onChange,
}: DropConfigFieldProps) {
  const [plants, setPlants] = useState<PlantEntry[]>(plantCache ?? []);
  const [showPlantSelector, setShowPlantSelector] = useState(false);

  useEffect(() => {
    fetchPlants().then(setPlants).catch(() => {});
  }, []);

  const plantMap = useMemo(() => {
    const map = new Map<string, PlantEntry>();
    for (const p of plants) map.set(p.id, p);
    return map;
  }, [plants]);

  const count = (data.AdditionalPlantfood as number | null | undefined) ?? 0;
  const spawnPlantList = (data.SpawnPlantName as string[] | null | undefined) ?? [];
  const isDroppingPlants =
    spawnPlantList.length === count &&
    spawnPlantList.length > 0;

  const updateData = useCallback(
    (patch: Record<string, unknown>) => {
      onChange({ ...data, ...patch });
    },
    [data, onChange]
  );

  const handleCountChange = useCallback(
    (newVal: number) => {
      const finalVal = newVal <= 0 ? null : newVal;
      updateData({ AdditionalPlantfood: finalVal });
    },
    [updateData]
  );

  const handleAddPlant = useCallback(
    (plantId: string) => {
      const newList = [...spawnPlantList, plantId];
      updateData({ SpawnPlantName: newList.length === 0 ? null : newList });
      setShowPlantSelector(false);
    },
    [spawnPlantList, updateData]
  );

  const handleRemovePlant = useCallback(
    (index: number) => {
      const newList = spawnPlantList.filter((_, i) => i !== index);
      updateData({ SpawnPlantName: newList.length === 0 ? null : newList });
    },
    [spawnPlantList, updateData]
  );

  const cardTitle = isDroppingPlants
    ? (field.label ?? "掉落物配置") + "（植物）"
    : (field.label ?? "掉落物配置") + "（能量豆）";

  const explainText =
    count > 0
      ? isDroppingPlants
        ? `本波次将有 ${count} 只僵尸掉落列表中的植物`
        : `本波次将有 ${count} 只僵尸携带能量豆`
      : "无额外掉落";

  return (
    <div className="form-control">
      <div className="rounded-lg border border-base-300 bg-base-100">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-base-200 px-4 py-2.5">
          {isDroppingPlants ? (
            <Leaf className="h-4 w-4 text-success" />
          ) : (
            <Droplets className="h-4 w-4 text-primary" />
          )}
          <span
            className={`text-xs font-semibold ${isDroppingPlants ? "text-success" : "text-primary"}`}
          >
            {cardTitle}
          </span>
        </div>

        <div className="space-y-3 p-4">
          {/* SpawnPlantName list */}
          <div>
            <div className="mb-1.5 text-xs font-medium text-base-content/70">
              指定掉落植物 (SpawnPlantName)
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {spawnPlantList.map((plantId, index) => {
                const entry = plantMap.get(plantId);
                return (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/5 px-2 py-0.5 text-xs text-success"
                  >
                    {entry && (
                      <img
                        src={getPlantImagePath(entry)}
                        alt=""
                        className="h-4 w-4 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    {entry?.name ?? plantId}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-success/20"
                      onClick={() => handleRemovePlant(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              {showPlantSelector ? (
                <PlantSelector
                  plants={plants}
                  onSelect={handleAddPlant}
                  onCancel={() => setShowPlantSelector(false)}
                />
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-base-300 px-2 py-0.5 text-xs text-base-content/40 hover:border-success hover:text-success"
                  onClick={() => setShowPlantSelector(true)}
                >
                  <Plus className="h-3 w-3" />
                  添加植物
                </button>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-base-content/40">
              当掉落植物列表的植物数等于能量豆数量时会变为掉落植物卡片
            </p>
          </div>

          {/* AdditionalPlantfood count */}
          <div>
            <label className="mb-1 block text-xs font-medium text-base-content/70">
              {isDroppingPlants
                ? "携带上述植物的僵尸数量 (AdditionalPlantfood)"
                : "携带能量豆的僵尸数量 (AdditionalPlantfood)"}
            </label>
            <input
              type="number"
              className="input input-bordered input-sm w-full"
              min={0}
              value={count}
              onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                handleCountChange(isNaN(num) ? 0 : num);
              }}
            />
          </div>

          {/* Explanation */}
          <p className="text-xs text-base-content/50">{explainText}</p>
        </div>
      </div>
    </div>
  );
}

// --- Inline Plant Selector ---

interface PlantSelectorProps {
  plants: PlantEntry[];
  onSelect: (plantId: string) => void;
  onCancel: () => void;
}

function PlantSelector({ plants, onSelect, onCancel }: PlantSelectorProps) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const p of plants) {
      for (const t of p.tags) tagSet.add(t);
    }
    return Array.from(tagSet).sort();
  }, [plants]);

  const filteredAll = useMemo(() => {
    let list = plants;
    if (activeTag) {
      list = list.filter((p) => p.tags.includes(activeTag));
    }
    if (search) {
      const lower = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(lower) ||
          p.name.toLowerCase().includes(lower)
      );
    }
    return list;
  }, [plants, search, activeTag]);

  const totalPages = Math.ceil(filteredAll.length / PAGE_SIZE);
  const filtered = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAll.slice(start, start + PAGE_SIZE);
  }, [filteredAll, page]);

  useEffect(() => {
    setPage(1);
  }, [search, activeTag]);

  return (
    <div className="w-full">
      <div className="mt-1 overflow-hidden rounded-lg border border-success/30 bg-base-100 shadow-md">
        {/* Search */}
        <div className="flex items-center gap-1 border-b border-base-200 px-2 py-1.5">
          <Search className="h-3 w-3 shrink-0 text-base-content/30" />
          <input
            type="text"
            className="input input-xs flex-1 border-0 bg-transparent focus:outline-none"
            placeholder="搜索植物..."
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
                  ? "bg-success text-success-content"
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
                    ? "bg-success text-success-content"
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
              <Leaf className="mx-auto mb-1 h-4 w-4" />
              没有匹配的植物
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                className="flex w-full items-center gap-2 px-2 py-1 text-left text-xs hover:bg-base-200"
                onClick={() => onSelect(p.id)}
              >
                <img
                  src={getPlantImagePath(p)}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded object-cover bg-base-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{p.name}</div>
                  <div className="truncate font-mono text-[10px] text-base-content/40">
                    {p.id}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-base-200 px-2 py-1">
            <span className="text-[10px] text-base-content/40">
              共 {filteredAll.length} 项
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <span className="text-[10px]">
                {page}/{totalPages}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-square"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
