// Deterministic slug generator for category hub URLs (/productos/categoria/[slug]).
// Every surface (links, param resolution, sitemap) derives the same slug from a
// category name, so the mapping stays consistent in both directions.
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents/diacritics (á -> a, ñ -> n)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // any non-alphanumeric run becomes one hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}
