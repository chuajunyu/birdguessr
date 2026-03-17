import type { Recording, XCResponse } from "./types";

const API_KEY = import.meta.env.VITE_XC_API_KEY as string;

export async function fetchRecordings(
  gen: string,
  sp: string,
): Promise<Recording[]> {
  const query = `gen:${gen}+sp:${sp}+cnt:singapore+q:%22>C%22`;
  const url = `/api/xc?query=${query}&key=${encodeURIComponent(API_KEY)}&per_page=50`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`xeno-canto API error: ${res.status}`);
  }

  const data: XCResponse = await res.json();
  return data.recordings;
}
