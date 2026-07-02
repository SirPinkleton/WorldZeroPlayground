/* Small formatting helpers shared by every faction skin. */

/** 1204 → "1,204" */
export const fmt = (n: number): string => n.toLocaleString("en-US");

/** 47200 → "47.2k" ; 640 → "640" */
export const kfmt = (n: number): string =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : "" + n;

/** 12 → "XII". Returns "" for null/undefined. Used by UA + Ephemerists. */
export function roman(n: number | null | undefined): string {
  if (n == null) return "";
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let v = n;
  for (const [val, sym] of map) {
    while (v >= val) {
      out += sym;
      v -= val;
    }
  }
  return out;
}

/** "It Referenced Itself" → { head: "It Referenced ", last: "Itself" }.
 *  Skins colour the last word differently (Singularity, Ephemerists). */
export function splitLast(text: string): { head: string; last: string } {
  const words = text.trim().split(" ");
  const last = words.pop() ?? "";
  return { head: words.join(" ") + (words.length ? " " : ""), last };
}

/** First letter of a name. Node names like "NODE_Vesper" use the part
 *  after the underscore; "Keeper Vane" uses the surname. */
export function initialOf(
  name: string,
  mode: "first" | "afterUnderscore" | "surname" = "first",
): string {
  if (mode === "afterUnderscore") {
    const part = name.includes("_") ? name.split("_").pop()! : name;
    return part[0].toUpperCase();
  }
  if (mode === "surname") return name.split(" ").pop()![0];
  return name[0];
}
