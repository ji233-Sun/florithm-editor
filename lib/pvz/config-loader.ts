// =============================================================================
// Config Loader — lazily fetches and caches module/event/challenge/stage configs
// from public/data/configs/ static files.
// =============================================================================

import type { ModuleConfig, EventConfig, ChallengeConfig } from "./types";

// --- Index entry types ---

export interface ModuleIndexEntry {
  id: string;
  objclass: string;
  category: "base" | "mode" | "scene";
  file: string;
}

export interface EventIndexEntry {
  id: string;
  objclass: string;
  file: string;
}

export interface ChallengeIndexEntry {
  id: string;
  objclass: string;
  file: string;
}

export interface StageEntry {
  id: string;
  name: string;
  rtid: string;
  type: "main" | "extra" | "seasons" | "special";
  image: string | null;
}

// --- In-memory cache ---

const cache = new Map<string, unknown>();

async function fetchJson<T>(path: string): Promise<T> {
  const cached = cache.get(path);
  if (cached) return cached as T;

  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  const data: T = await res.json();
  cache.set(path, data);
  return data;
}

// --- Module configs ---

let moduleIndexCache: ModuleIndexEntry[] | null = null;

export async function loadModuleIndex(): Promise<ModuleIndexEntry[]> {
  if (moduleIndexCache) return moduleIndexCache;
  const data = await fetchJson<{ modules: ModuleIndexEntry[] }>(
    "/data/configs/modules/_index.json"
  );
  moduleIndexCache = data.modules;
  return moduleIndexCache;
}

export async function loadModuleConfig(
  objclass: string
): Promise<ModuleConfig | null> {
  const index = await loadModuleIndex();
  const entry = index.find((m) => m.objclass === objclass);
  if (!entry) return null;
  return fetchJson<ModuleConfig>(`/data/configs/modules/${entry.file}`);
}

// --- Event configs ---

let eventIndexCache: EventIndexEntry[] | null = null;

export async function loadEventIndex(): Promise<EventIndexEntry[]> {
  if (eventIndexCache) return eventIndexCache;
  const data = await fetchJson<{ events: EventIndexEntry[] }>(
    "/data/configs/events/_index.json"
  );
  eventIndexCache = data.events;
  return eventIndexCache;
}

export async function loadEventConfig(
  objclass: string
): Promise<EventConfig | null> {
  const index = await loadEventIndex();
  const entry = index.find((e) => e.objclass === objclass);
  if (!entry) return null;
  return fetchJson<EventConfig>(`/data/configs/events/${entry.file}`);
}

// --- Challenge configs ---

let challengeIndexCache: ChallengeIndexEntry[] | null = null;

export async function loadChallengeIndex(): Promise<ChallengeIndexEntry[]> {
  if (challengeIndexCache) return challengeIndexCache;
  const data = await fetchJson<{ challenges: ChallengeIndexEntry[] }>(
    "/data/configs/challenges/_index.json"
  );
  challengeIndexCache = data.challenges;
  return challengeIndexCache;
}

export async function loadChallengeConfig(
  objclass: string
): Promise<ChallengeConfig | null> {
  const index = await loadChallengeIndex();
  const entry = index.find((c) => c.objclass === objclass);
  if (!entry) return null;
  return fetchJson<ChallengeConfig>(`/data/configs/challenges/${entry.file}`);
}

// --- Stages ---

let stagesCache: StageEntry[] | null = null;

export async function loadStages(): Promise<StageEntry[]> {
  if (stagesCache) return stagesCache;
  const data = await fetchJson<{ stages: StageEntry[] }>(
    "/data/configs/stages.json"
  );
  stagesCache = data.stages;
  return stagesCache;
}
