// =============================================================================
// Level Serializer — converts a list of PvzObjects back into a PvzLevelFile
// with proper canonical ordering.
//
// Translated from Z-Editor ObjectOrderRegistry.kt comparator logic.
// =============================================================================

import type { PvzLevelFile, PvzObject } from "./types";
import { getObjectPriority } from "./object-order";

/**
 * Serialize an array of PvzObjects into a PvzLevelFile.
 *
 * The objects are sorted following Z-Editor's canonical ordering:
 * 1. Objects whose objclass is in the ORDER_LIST sort by their list index.
 * 2. Objects not in the ORDER_LIST sort after all known types, grouped
 *    alphabetically by objclass.
 * 3. Objects with the same objclass sort by their first alias using
 *    natural string comparison (embedded numbers compared numerically).
 */
export function serializeLevel(objects: PvzObject[]): PvzLevelFile {
  const sorted = [...objects].sort(pvzObjectComparator);
  return { objects: sorted, version: 1 };
}

/**
 * Comparator for PvzObject sorting — mirrors Z-Editor's ObjectOrderRegistry.comparator.
 */
function pvzObjectComparator(a: PvzObject, b: PvzObject): number {
  const pa = getObjectPriority(a.objclass);
  const pb = getObjectPriority(b.objclass);

  // Case 1: Both in the known order list
  if (pa !== Number.MAX_SAFE_INTEGER && pb !== Number.MAX_SAFE_INTEGER) {
    return pa - pb;
  }

  // Case 2: Only one is in the known order list — it sorts first
  if (pa !== Number.MAX_SAFE_INTEGER) return -1;
  if (pb !== Number.MAX_SAFE_INTEGER) return 1;

  // Case 3: Neither is in the known list — group by objclass alphabetically
  if (a.objclass !== b.objclass) {
    return a.objclass < b.objclass ? -1 : 1;
  }

  // Case 4: Same objclass — sort by first alias using natural comparison
  const aliasA = a.aliases?.[0] ?? "";
  const aliasB = b.aliases?.[0] ?? "";
  return naturalCompare(aliasA, aliasB);
}

/**
 * Natural string comparison that handles embedded numbers.
 *
 * "Wave2" < "Wave10" (because 2 < 10 numerically)
 *
 * Translated from Z-Editor's ObjectOrderRegistry.naturalStringComparator.
 */
function naturalCompare(a: string, b: string): number {
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    const ca = a[i];
    const cb = b[j];

    // If both characters are digits, extract the full numeric segments
    if (isDigit(ca) && isDigit(cb)) {
      let numA = 0;
      while (i < a.length && isDigit(a[i])) {
        if (numA < 1e17) {
          numA = numA * 10 + (a.charCodeAt(i) - 48);
        }
        i++;
      }

      let numB = 0;
      while (j < b.length && isDigit(b[j])) {
        if (numB < 1e17) {
          numB = numB * 10 + (b.charCodeAt(j) - 48);
        }
        j++;
      }

      if (numA !== numB) {
        return numA - numB;
      }
    } else {
      // Character comparison
      if (ca !== cb) {
        return ca < cb ? -1 : 1;
      }
      i++;
      j++;
    }
  }

  // Shorter string sorts first
  return a.length - b.length;
}

function isDigit(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 48 && code <= 57; // '0' (48) to '9' (57)
}

/**
 * Convert a PvzLevelFile to a formatted JSON string.
 * Uses 2-space indentation matching PvZ2's file format.
 */
export function serializeToJson(
  objects: PvzObject[],
  indent: number = 2
): string {
  const file = serializeLevel(objects);
  return JSON.stringify(file, null, indent);
}
