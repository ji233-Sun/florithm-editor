// =============================================================================
// RTID Parser/Builder — translated from Z-Editor RtidParser.kt
// =============================================================================

/**
 * Parsed RTID reference information.
 *
 * @example
 * parseRtid("RTID(SeedBank@CurrentLevel)")
 * // => { alias: "SeedBank", source: "CurrentLevel", raw: "RTID(SeedBank@CurrentLevel)" }
 */
export interface RtidInfo {
  /** The alias portion, e.g. "SeedBank" */
  alias: string;
  /** The source portion, e.g. "CurrentLevel" or "LevelModules" */
  source: string;
  /** The original full RTID string */
  raw: string;
}

const RTID_REGEX = /^RTID\((.+)@(.+)\)$/;

/**
 * Parse an RTID string into its components.
 * Returns null if the string is not a valid RTID.
 *
 * @example
 * parseRtid("RTID(DefaultSunDropper@LevelModules)")
 * // => { alias: "DefaultSunDropper", source: "LevelModules", raw: "..." }
 *
 * parseRtid("not-an-rtid")
 * // => null
 */
export function parseRtid(value: string): RtidInfo | null {
  if (!value) return null;
  const match = value.match(RTID_REGEX);
  if (!match) return null;
  return {
    alias: match[1],
    source: match[2],
    raw: value,
  };
}

/**
 * Build an RTID string from alias and source.
 * Defaults source to "LevelModules" if not specified.
 *
 * @example
 * buildRtid("SeedBank", "CurrentLevel")
 * // => "RTID(SeedBank@CurrentLevel)"
 *
 * buildRtid("DefaultSunDropper")
 * // => "RTID(DefaultSunDropper@LevelModules)"
 */
export function buildRtid(
  alias: string,
  source: string = "LevelModules"
): string {
  return `RTID(${alias}@${source})`;
}

/**
 * Check whether a string is a valid RTID reference.
 */
export function isRtid(value: string): boolean {
  return RTID_REGEX.test(value);
}

/**
 * Extract just the alias portion from an RTID string.
 * Returns the original string if it is not a valid RTID.
 *
 * @example
 * extractAlias("RTID(SeedBank@CurrentLevel)")
 * // => "SeedBank"
 *
 * extractAlias("not-an-rtid")
 * // => "not-an-rtid"
 */
export function extractAlias(rtid: string): string {
  const info = parseRtid(rtid);
  return info ? info.alias : rtid;
}

/**
 * Extract just the source portion from an RTID string.
 * Returns null if the string is not a valid RTID.
 */
export function extractSource(rtid: string): string | null {
  const info = parseRtid(rtid);
  return info ? info.source : null;
}

/**
 * Check whether an RTID references a local object (source === "CurrentLevel").
 */
export function isLocalRtid(value: string): boolean {
  const info = parseRtid(value);
  return info !== null && info.source === "CurrentLevel";
}

/**
 * Check whether an RTID references a built-in module (source === "LevelModules").
 */
export function isBuiltinRtid(value: string): boolean {
  const info = parseRtid(value);
  return info !== null && info.source === "LevelModules";
}
