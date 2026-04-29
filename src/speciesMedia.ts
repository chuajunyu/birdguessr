import type { Species } from "./types";

const BIRD_IMAGES_BASE = "/images/birds";

/** Slug for files in `public/images/birds/`: `gen-sp` in lowercase. */
export function speciesSlug(s: Pick<Species, "gen" | "sp">): string {
  return `${s.gen}-${s.sp}`.toLowerCase();
}

/** Default hero/thumb URL: `<slug>.jpg` under `public/images/birds/`. */
export function defaultBirdImageSrc(s: Pick<Species, "gen" | "sp">): string {
  return `${BIRD_IMAGES_BASE}/${speciesSlug(s)}.jpg`;
}
