import { Category, Product } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fail fast si la API no responde: las páginas degradan con gracia a vacío.
const FETCH_TIMEOUT_MS = 8000;

// Server-side catalog fetchers used by pages that server-render initial data.
// Revalidated so repeated requests hit Next's data cache instead of the API.

export async function getCatalogProducts(
  featured?: boolean,
): Promise<Product[]> {
  try {
    const url = new URL(`${API_URL}/products`);
    if (featured !== undefined) {
      url.searchParams.append("featured", featured.toString());
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch {
    return [];
  }
}

export async function getCatalogCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch {
    return [];
  }
}
