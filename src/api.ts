import type { Recording, XCResponse } from "./types";

const isDev = import.meta.env.DEV;

function xcApiUrl(query: string): string {
  if (isDev) {
    const apiKey = import.meta.env.VITE_XC_API_KEY as string;
    return `/api/xc?query=${query}&key=${encodeURIComponent(apiKey)}&per_page=50`;
  }
  return `/.netlify/functions/xc?query=${query}`;
}

export function xcAudioUrl(id: string): string {
  if (isDev) {
    return `/audio/xc/${id}/download`;
  }
  return `https://xeno-canto.org/${id}/download`;
}

export async function fetchRecordings(
  gen: string,
  sp: string,
): Promise<Recording[]> {
  const query = `gen:${gen}+sp:${sp}+cnt:singapore+q:%22>C%22`;
  const url = xcApiUrl(query);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`xeno-canto API error: ${res.status}`);
  }

  const data: XCResponse = await res.json();
  return data.recordings;
}
