import type { LocalRecording } from "./types";

function speciesFolderKey(gen: string, sp: string): string {
  return `${gen}-${sp}`.toLowerCase();
}

function fileLabelFromPath(path: string): string {
  const normalized = path.replaceAll("\\", "/");
  const idx = normalized.lastIndexOf("/");
  return idx >= 0 ? normalized.slice(idx + 1) : normalized;
}

const localAudioModules = import.meta.glob("/public/audio/local/**/*.wav", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const localAudioBySpecies = (() => {
  const bySpecies = new Map<string, Array<{ src: string; label: string }>>();
  for (const [path, src] of Object.entries(localAudioModules)) {
    const normalized = path.replaceAll("\\", "/");
    const parts = normalized.split("/").filter(Boolean);
    const localIdx = parts.findIndex((p) => p === "local");
    const speciesKey = localIdx >= 0 ? parts[localIdx + 1] : "";
    if (!speciesKey) continue;
    const list = bySpecies.get(speciesKey) ?? [];
    list.push({ src, label: fileLabelFromPath(normalized) });
    bySpecies.set(speciesKey, list);
  }
  return bySpecies;
})();

export function getLocalRecordingsForSpecies(
  gen: string,
  sp: string,
  en: string,
): LocalRecording[] {
  const key = speciesFolderKey(gen, sp);
  const files = localAudioBySpecies.get(key) ?? [];
  return files.map((f, idx) => ({
    source: "local",
    id: `local-${key}-${idx + 1}`,
    gen,
    sp,
    en,
    src: f.src,
    label: f.label,
    length: "",
  }));
}

export function getLocalRecordingCount(gen: string, sp: string): number {
  const key = speciesFolderKey(gen, sp);
  return (localAudioBySpecies.get(key) ?? []).length;
}
