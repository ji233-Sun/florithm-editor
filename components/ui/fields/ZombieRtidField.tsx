"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, ChevronDown, Skull, ChevronLeft, ChevronRight } from "lucide-react";
import type { FieldDefinition } from "@/lib/pvz/types";

interface ZombieRtidFieldProps {
  field: FieldDefinition;
  value: string | null | undefined;
  onChange: (value: string) => void;
  idMode?: boolean;
}

interface ZombieEntry {
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

function getImagePath(entry: ZombieEntry): string {
  return `/data/images/zombies/${entry.icon.replace(".webp", ".jpg")}`;
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

export function ZombieRtidField({
  field,
  value,
  onChange,
  idMode,
}: ZombieRtidFieldProps) {
  const [zombies, setZombies] = useState<ZombieEntry[]>(zombieCache ?? []);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const PAGE_SIZE = 40;

  useEffect(() => {
    fetchZombies().then(setZombies).catch(() => {});
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
  const selectedZombie = useMemo(
    () => zombies.find((z) => z.id === currentId),
    [zombies, currentId]
  );

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const z of zombies) {
      for (const t of z.tags) tagSet.add(t);
    }
    return Array.from(tagSet).sort();
  }, [zombies]);

  const filteredAll = useMemo(() => {
    let list = zombies;
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
    return list;
  }, [zombies, search, activeTag]);

  const totalPages = Math.ceil(filteredAll.length / PAGE_SIZE);
  const filtered = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAll.slice(start, start + PAGE_SIZE);
  }, [filteredAll, page]);

  // Reset page when search or tag changes
  useEffect(() => {
    setPage(1);
  }, [search, activeTag]);

  function handleSelect(zombie: ZombieEntry) {
    if (idMode) {
      onChange(zombie.id);
    } else {
      onChange(`RTID(${zombie.id}@ZombieTypes)`);
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
        {selectedZombie ? (
          <>
            <img
              src={getImagePath(selectedZombie)}
              alt=""
              className="h-7 w-7 shrink-0 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{selectedZombie.name}</div>
              <div className="truncate font-mono text-xs text-base-content/40">
                {selectedZombie.id}
              </div>
            </div>
          </>
        ) : value ? (
          <>
            <Skull className="h-5 w-5 shrink-0 text-base-content/30" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-xs text-base-content/60">{value}</div>
            </div>
          </>
        ) : (
          <>
            <Skull className="h-5 w-5 shrink-0 text-base-content/20" />
            <span className="text-sm text-base-content/30">选择僵尸...</span>
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
                placeholder="搜索僵尸名称或ID..."
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
                没有匹配的僵尸
              </div>
            ) : (
              filtered.map((z) => {
                const isSelected = z.id === currentId;
                return (
                  <button
                    key={z.id}
                    type="button"
                    className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-base-200"
                    }`}
                    onClick={() => handleSelect(z)}
                  >
                    <img
                      src={getImagePath(z)}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded object-cover bg-base-200"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{z.name}</div>
                      <div className="truncate font-mono text-xs text-base-content/40">
                        {z.id}
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
