import { resolveMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

// Serves the text/markdown representation of any public page.
// Reached via rewrite from proxy.ts when a client sends Accept: text/markdown.
// Direct hits also work (marked noindex so search engines ignore them).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  const pathname = "/" + (path ?? []).join("/");
  const { status, body } = await resolveMarkdown(pathname);

  // Order tracking responses are per-user: never cache them.
  const isOrderPath = /^\/pedido\//.test(pathname);

  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept, Accept-Encoding",
      "X-Robots-Tag": "noindex",
      ...(status === 200 && !isOrderPath
        ? { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
        : {}),
    },
  });
}
