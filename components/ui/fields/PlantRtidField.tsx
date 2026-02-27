"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, ChevronDown, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import type { FieldDefinition } from "@/lib/pvz/types";

interface PlantRtidFieldProps {
  field: FieldDefinition;
  value: string | null | undefined;
  onChange: (value: string) => void;
  idMode?: boolean;
}

interface PlantEntry {
  id: string;
  name: string;
  tags: string[];
  icon: string;
}

function extractId(value: string | null | undefined): string {
  if (!value) return "";
  const match = value.match(/^RTID\(([^@]+)@/);
  return match ? match[1] : value;
}

function getImagePath(entry: PlantEntry): string {
  return `/data/images/plants/${entry.icon.replace(".webp", ".jpg")}`;
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

export function PlantRtidField({
  field,
  value,
  onChange,
  idMode,
}: PlantRtidFieldProps) {
  const [plants, setPlants] = useState<PlantEntry[]>(plantCache ?? []);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const PAGE_SIZE = 40;

  useEffect(() => {
    fetchPlants().then(setPlants).catch(() => {});
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const currentId = extractId(value);
  const selectedPlant = useMemo(
    () => plants.find((p) => p.id === currentId),
    [plants, currentId]
  );

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

  // Reset page when search or tag changes
  useEffect(() => {
    setPage(1);
  }, [search, activeTag]);

  function handleSelect(plant: PlantEntry) {
    if (idMode) {
      onChange(plant.id);
    } else {
      onChange(`RTID(${plant.id}@PlantTypes)`);
    }
    setOpen(false);
    setSearch("");
    setActiveTag(null);
  }

  function handleClear() {
    onChange("");
    setOpen(false);
  }

  const hasLabel = !!field.label;

  return (
    <div className="form-control" ref={containerRef}>
      {hasLabel && (
        <label className="label">
          <span className="label-text">{field.label}</span>
        </label>
      )}
      {field.description && (
        <p className="mb-1.5 text-xs text-base-content/50">{field.description}</p>
      )}

      {/* Selected display / trigger */}
      <button
        type="button"
        className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
          open
            ? "border-primary/50 bg-primary/5"
            : "border-base-300 bg-base-100 hover:border-base-content/20"
        }`}
        onClick={() => setOpen(!open)}
      >
        {selectedPlant ? (
          <>
            <img
              src={getImagePath(selectedPlant)}
              alt=""
              className="h-7 w-7 shrink-0 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{selectedPlant.name}</div>
              <div className="truncate font-mono text-xs text-base-content/40">
                {selectedPlant.id}
              </div>
            </div>
          </>
        ) : value ? (
          <>
            <Leaf className="h-5 w-5 shrink-0 text-base-content/30" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-xs text-base-content/60">{value}</div>
            </div>
          </>
        ) : (
          <>
            <Leaf className="h-5 w-5 shrink-0 text-base-content/20" />
            <span className="text-sm text-base-content/30">选择植物...</span>
          </>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {value && (
            <span
              role="button"
              className="rounded p-0.5 hover:bg-base-300"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              <X className="h-3.5 w-3.5 text-base-content/40" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-base-content/30 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="relative z-20 mt-1 overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-lg">
          {/* Search */}
          <div className="border-b border-base-300 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-base-content/30" />
              <input
                ref={searchRef}
                type="text"
                className="input input-sm w-full pl-8"
                placeholder="搜索植物名称或ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 border-b border-base-300 px-2 py-1.5">
              <button
                type="button"
                className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                  !activeTag
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content/60 hover:bg-base-300"
                }`}
                onClick={() => setActiveTag(null)}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                    activeTag === tag
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 text-base-content/60 hover:bg-base-300"
                  }`}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-base-content/40">
                没有匹配的植物
              </div>
            ) : (
              filtered.map((p) => {
                const isSelected = p.id === currentId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-base-200"
                    }`}
                    onClick={() => handleSelect(p)}
                  >
                    <img
                      src={getImagePath(p)}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded object-cover bg-base-200"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{p.name}</div>
                      <div className="truncate font-mono text-xs text-base-content/40">
                        {p.id}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-base-300 px-3 py-2">
              <span className="text-xs text-base-content/50">
                共 {filteredAll.length} 项 · 第 {page}/{totalPages} 页
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-square"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
