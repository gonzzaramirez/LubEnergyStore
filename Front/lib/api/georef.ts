import { Provincia, Localidad } from "@/lib/types";

const GEOREF_API = "https://apis.datos.gob.ar/georef/api";

export async function getProvincias(): Promise<Provincia[]> {
  try {
    const response = await fetch(
      `${GEOREF_API}/provincias?campos=id,nombre&max=24&orden=nombre`,
      { next: { revalidate: 86400 } } // Cache por 24 horas
    );

    if (!response.ok) {
      throw new Error("Error al obtener provincias");
    }

    const data = await response.json();
    return data.provincias;
  } catch (error) {
    console.error("Error fetching provincias:", error);
    // Fallback con provincias hardcodeadas
    return PROVINCIAS_FALLBACK;
  }
}

export async function getLocalidades(
  provinciaId: string,
  busqueda?: string
): Promise<Localidad[]> {
  try {
    let url = `${GEOREF_API}/localidades?provincia=${provinciaId}&campos=id,nombre&max=100&orden=nombre`;
    
    if (busqueda && busqueda.length >= 2) {
      url += `&nombre=${encodeURIComponent(busqueda)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error al obtener localidades");
    }

    const data = await response.json();
    return data.localidades;
  } catch (error) {
    console.error("Error fetching localidades:", error);
    return [];
  }
}

// Búsqueda de localidades con autocompletado
export async function searchLocalidades(
  query: string,
  provinciaId?: string
): Promise<Localidad[]> {
  if (query.length < 2) return [];

  try {
    let url = `${GEOREF_API}/localidades?nombre=${encodeURIComponent(query)}&campos=id,nombre,provincia&max=10&orden=nombre`;
    
    if (provinciaId) {
      url += `&provincia=${provinciaId}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error en búsqueda de localidades");
    }

    const data = await response.json();
    return data.localidades;
  } catch (error) {
    console.error("Error searching localidades:", error);
    return [];
  }
}

// Fallback de provincias en caso de error de la API
const PROVINCIAS_FALLBACK: Provincia[] = [
  { id: "06", nombre: "Buenos Aires" },
  { id: "02", nombre: "Ciudad Autónoma de Buenos Aires" },
  { id: "10", nombre: "Catamarca" },
  { id: "22", nombre: "Chaco" },
  { id: "26", nombre: "Chubut" },
  { id: "14", nombre: "Córdoba" },
  { id: "18", nombre: "Corrientes" },
  { id: "30", nombre: "Entre Ríos" },
  { id: "34", nombre: "Formosa" },
  { id: "38", nombre: "Jujuy" },
  { id: "42", nombre: "La Pampa" },
  { id: "46", nombre: "La Rioja" },
  { id: "50", nombre: "Mendoza" },
  { id: "54", nombre: "Misiones" },
  { id: "58", nombre: "Neuquén" },
  { id: "62", nombre: "Río Negro" },
  { id: "66", nombre: "Salta" },
  { id: "70", nombre: "San Juan" },
  { id: "74", nombre: "San Luis" },
  { id: "78", nombre: "Santa Cruz" },
  { id: "82", nombre: "Santa Fe" },
  { id: "86", nombre: "Santiago del Estero" },
  { id: "94", nombre: "Tierra del Fuego" },
  { id: "90", nombre: "Tucumán" },
];
