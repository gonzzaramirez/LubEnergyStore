// Content negotiation for Accept: text/markdown vs text/html.
// Follows acceptmarkdown.com guidance: parse q-values, prefer more specific
// media ranges, break ties by header position. A wildcard-only Accept
// (e.g. "*/*" or "text/*") resolves to the default HTML representation.

export type Negotiation = "markdown" | "html" | "not-acceptable";

export interface AcceptPart {
  type: string;
  subtype: string;
  quality: number;
  order: number;
}

export function parseAccept(header: string | null | undefined): AcceptPart[] {
  if (!header) return [];
  return header
    .split(",")
    .map((raw, order) => {
      const [mediaRange, ...params] = raw.trim().split(";");
      const [type = "", subtype = ""] = mediaRange
        .trim()
        .toLowerCase()
        .split("/");
      let quality = 1;
      for (const param of params) {
        const [key, value] = param.trim().split("=");
        if (key === "q") {
          const parsed = Number.parseFloat(value);
          if (!Number.isNaN(parsed)) {
            quality = Math.min(1, Math.max(0, parsed));
          }
        }
      }
      return { type, subtype, quality, order };
    })
    .filter((part) => part.type !== "" && part.subtype !== "");
}

function specificityOf(
  part: AcceptPart,
  type: string,
  subtype: string,
): number {
  if (part.type === type && part.subtype === subtype) return 2;
  if (part.type === type && part.subtype === "*") return 1;
  if (part.type === "*" && part.subtype === "*") return 0;
  return -1;
}

/**
 * Decide which representation to serve for an Accept header:
 * - "markdown": client prefers text/markdown over text/html
 * - "html": default representation (no header, wildcards, or html preferred)
 * - "not-acceptable": client explicitly excluded both offers -> answer 406
 */
export function negotiateMarkdown(
  acceptHeader: string | null | undefined,
): Negotiation {
  if (!acceptHeader || acceptHeader.trim() === "") return "html";

  const parts = parseAccept(acceptHeader);
  if (parts.length === 0) return "html";

  // html first so a single wildcard matching both offers resolves to HTML.
  const offers = [
    { key: "html" as const, type: "text", subtype: "html" },
    { key: "markdown" as const, type: "text", subtype: "markdown" },
  ];

  let best: {
    key: Exclude<Negotiation, "not-acceptable">;
    quality: number;
    specificity: number;
    order: number;
  } | null = null;

  for (const part of parts) {
    if (part.quality <= 0) continue;
    for (const offer of offers) {
      const specificity = specificityOf(part, offer.type, offer.subtype);
      if (specificity < 0) continue;
      const candidate = {
        key: offer.key,
        quality: part.quality,
        specificity,
        order: part.order,
      };
      if (
        !best ||
        candidate.quality > best.quality ||
        (candidate.quality === best.quality &&
          (candidate.specificity > best.specificity ||
            (candidate.specificity === best.specificity &&
              candidate.order < best.order)))
      ) {
        best = candidate;
      }
    }
  }

  if (!best) return "not-acceptable";
  return best.key;
}
