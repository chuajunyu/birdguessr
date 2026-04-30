import type { XCRecording, XCResponse } from "./types";

const isDev = import.meta.env.DEV;
const MIN_RECORDINGS_PER_SPECIES = 8;

/** True if XC returned enough data to play this clip (restricted species omit/redact `file`). */
export function isXcRecordingPlayable(rec: {
  file?: string;
  _meta?: { redacted_fields?: Record<string, string> };
}): boolean {
  const rf = rec._meta?.redacted_fields;
  if (rf) {
    if (rf.file === "restricted_species" || rf["file-name"] === "restricted_species") {
      return false;
    }
  }
  const file = typeof rec.file === "string" ? rec.file.trim() : "";
  return file.length > 0;
}

function xcApiUrl(query: string, page?: number): string {
  const pageParam =
    typeof page === "number" && Number.isInteger(page) && page > 0
      ? `&page=${page}`
      : "";
  if (isDev) {
    const apiKey = import.meta.env.VITE_XC_API_KEY as string;
    return `/api/xc?query=${query}&key=${encodeURIComponent(apiKey)}&per_page=50${pageParam}`;
  }
  return `/.netlify/functions/xc?query=${query}${pageParam}`;
}

export function xcAudioUrl(id: string): string {
  if (isDev) {
    return `/audio/xc/${id}/download`;
  }
  return `https://xeno-canto.org/${id}/download`;
}

async function fetchRecordingsByQuery(query: string): Promise<XCRecording[]> {
  const firstPageRes = await fetch(xcApiUrl(query, 1));
  if (!firstPageRes.ok) {
    throw new Error(`xeno-canto API error: ${firstPageRes.status}`);
  }

  const firstPageData: XCResponse = await firstPageRes.json();
  const parsedNumPages = Number.parseInt(String(firstPageData.numPages), 10);
  const totalPages =
    Number.isFinite(parsedNumPages) && parsedNumPages > 0 ? parsedNumPages : 1;

  const toXc = (rec: (typeof firstPageData.recordings)[number]): XCRecording => ({
    ...rec,
    source: "xc",
  });

  if (totalPages <= 1) {
    return firstPageData.recordings.map(toXc).filter(isXcRecordingPlayable);
  }

  const randomPage = Math.floor(Math.random() * totalPages) + 1;
  if (randomPage === 1) {
    return firstPageData.recordings.map(toXc).filter(isXcRecordingPlayable);
  }

  const randomPageRes = await fetch(xcApiUrl(query, randomPage));
  if (!randomPageRes.ok) {
    throw new Error(`xeno-canto API error: ${randomPageRes.status}`);
  }

  const randomPageData: XCResponse = await randomPageRes.json();
  return randomPageData.recordings.map(toXc).filter(isXcRecordingPlayable);
}

function dedupeById(recordings: XCRecording[]): XCRecording[] {
  const seen = new Set<string>();
  const out: XCRecording[] = [];
  for (const rec of recordings) {
    if (seen.has(rec.id)) continue;
    seen.add(rec.id);
    out.push(rec);
  }
  return out;
}

function resolveXcQuerySpecies(gen: string, sp: string): { gen: string; sp: string } {
  if (gen.toLowerCase() === "cinnyris" && sp.toLowerCase() === "ornatus") {
    return { gen: "Cinnyris", sp: "jugularis" };
  }
  return { gen, sp };
}

export async function fetchRecordings(
  gen: string,
  sp: string,
): Promise<XCRecording[]> {
  const querySpecies = resolveXcQuerySpecies(gen, sp);
  const base = `gen:${querySpecies.gen}+sp:${querySpecies.sp}+cnt:singapore`;
  const [qualityA, qualityB] = await Promise.all([
    fetchRecordingsByQuery(`${base}+q:A`),
    fetchRecordingsByQuery(`${base}+q:B`),
  ]);
  const abRecordings = dedupeById([...qualityA, ...qualityB]);
  if (abRecordings.length >= MIN_RECORDINGS_PER_SPECIES) {
    return abRecordings;
  }

  const fallback = await fetchRecordingsByQuery(`${base}+q:%22>C%22`);
  return dedupeById([...abRecordings, ...fallback]);
}
