"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, ChevronDown, Grid3X3 } from "lucide-react";
import type { FieldDefinition } from "@/lib/pvz/types";

interface GridItemSelectFieldProps {
  field: FieldDefinition;
  value: string | null | undefined;
  onChange: (value: string) => void;
}

interface GridItemEntry {
  alias: string;
  typeName: string;
}

let gridItemCache: GridItemEntry[] | null = null;
let gridItemFetchPromise: Promise<GridItemEntry[]> | null = null;

function fetchGridItems(): Promise<GridItemEntry[]> {
  if (gridItemCache) return Promise.resolve(gridItemCache);
  if (gridItemFetchPromise) return gridItemFetchPromise;
  gridItemFetchPromise = fetch("/data/reference/GridItemTypes.json")
    .then((res) => res.json())
    .then((data) => {
      let entries: GridItemEntry[] = [];
      if (data?.objects) {
        entries = data.objects
          .filter(
            (o: { objclass?: string }) => o.objclass === "GridItemType"
          )
          .map(
            (o: {
              aliases?: string[];
              objdata?: { TypeName?: string };
            }) => ({
              alias: o.aliases?.[0] ?? "",
              typeName: o.objdata?.TypeName ?? o.aliases?.[0] ?? "",
            })
          );
      } else if (Array.isArray(data)) {
        entries = data.map((item: { TypeName?: string }) => ({
          alias: item.TypeName ?? "",
          typeName: item.TypeName ?? "",
        }));
      }
      gridItemCache = entries;
      return entries;
    });
  return gridItemFetchPromise;
}

export function GridItemSelectField({
  field,
  value,
  onChange,
}: GridItemSelectFieldProps) {
  const [items, setItems] = useState<GridItemEntry[]>(gridItemCache ?? []);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGridItems().then(setItems).catch(() => {});
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
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selectedItem = useMemo(
    () => items.find((i) => i.alias === value || i.typeName === value),
    [items, value]
  );

  const filtered = useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter(
      (i) =>
        i.alias.toLowerCase().includes(lower) ||
        i.typeName.toLowerCase().includes(lower)
    );
  }, [items, search]);

  function handleSelect(item: GridItemEntry) {
    onChange(item.alias);
    setOpen(false);
    setSearch("");
  }

  function handleClear() {
    onChange("");
    setOpen(false);
  }

  return (
    <div className="form-control" ref={containerRef}>
      <label className="label">
        <span className="label-text">{field.label}</span>
      </label>
      {field.description && (
        <p className="mb-1.5 text-xs text-base-content/50">
          {field.description}
        </p>
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
        {selectedItem ? (
          <>
            <Grid3X3 className="h-5 w-5 shrink-0 text-primary/60" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {selectedItem.alias}
              </div>
              {selectedItem.typeName !== selectedItem.alias && (
                <div className="truncate font-mono text-xs text-base-content/40">
                  {selectedItem.typeName}
                </div>
              )}
            </div>
          </>
        ) : value ? (
          <>
            <Grid3X3 className="h-5 w-5 shrink-0 text-base-content/30" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-xs text-base-content/60">
                {value}
              </div>
            </div>
          </>
        ) : (
          <>
            <Grid3X3 className="h-5 w-5 shrink-0 text-base-content/20" />
            <span className="text-sm text-base-content/30">
              选择障碍物...
            </span>
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
                placeholder="搜索障碍物..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-base-content/40">
                没有匹配的障碍物
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected =
                  item.alias === value || item.typeName === value;
                return (
                  <button
                    key={item.alias}
                    type="button"
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-base-200"
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    <Grid3X3 className="h-4 w-4 shrink-0 text-base-content/30" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{item.alias}</div>
                      {item.typeName !== item.alias && (
                        <div className="truncate font-mono text-xs text-base-content/40">
                          {item.typeName}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
