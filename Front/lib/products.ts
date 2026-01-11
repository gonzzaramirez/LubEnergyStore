export type Category = "all" | "proteinas" | "creatinas" | "pre-entrenos" | "aminoacidos" | "vitaminas"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: Category
  image: string
  badge?: string
  flavorId?: string
  flavorName?: string
}

export const categories: { id: Category; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "proteinas", label: "Proteínas" },
  { id: "creatinas", label: "Creatinas" },
  { id: "pre-entrenos", label: "Pre-Entrenos" },
  { id: "aminoacidos", label: "Aminoácidos" },
  { id: "vitaminas", label: "Vitaminas" },
]

export const products: Product[] = [
  {
    id: "1",
    name: "Whey Protein Gold",
    description: "2kg de proteína de suero de alta calidad. 24g de proteína por porción.",
    price: 45990,
    category: "proteinas",
    image: "/placeholder.svg?height=300&width=300",
    badge: "Más vendido",
  },
  {
    id: "2",
    name: "Isolate Premium",
    description: "1kg de proteína isolada. 27g de proteína, 0g azúcar.",
    price: 52990,
    category: "proteinas",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "3",
    name: "Creatina Monohidrato",
    description: "300g de creatina pura. Mejora fuerza y rendimiento.",
    price: 25990,
    category: "creatinas",
    image: "/placeholder.svg?height=300&width=300",
    badge: "Popular",
  },
  {
    id: "4",
    name: "Creatina HCL",
    description: "120 cápsulas de creatina HCL. Mayor absorción.",
    price: 32990,
    category: "creatinas",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "5",
    name: "Explosive Pre-Workout",
    description: "300g de pre-entreno con cafeína, beta-alanina y citrulina.",
    price: 35990,
    category: "pre-entrenos",
    image: "/placeholder.svg?height=300&width=300",
    badge: "Nuevo",
  },
  {
    id: "6",
    name: "Nitro Pump",
    description: "250g de pre-entreno sin estimulantes. Máximo pump.",
    price: 29990,
    category: "pre-entrenos",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "7",
    name: "BCAA 2:1:1",
    description: "300g de aminoácidos ramificados. Recuperación muscular.",
    price: 22990,
    category: "aminoacidos",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "8",
    name: "EAA Complex",
    description: "400g de aminoácidos esenciales completos.",
    price: 28990,
    category: "aminoacidos",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "9",
    name: "Multivitamínico Sport",
    description: "90 cápsulas. Vitaminas y minerales para deportistas.",
    price: 18990,
    category: "vitaminas",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "10",
    name: "Vitamina D3 + K2",
    description: "120 cápsulas. Salud ósea y sistema inmune.",
    price: 15990,
    category: "vitaminas",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "11",
    name: "Caseína Nocturna",
    description: "1kg de proteína de liberación lenta. Ideal para la noche.",
    price: 42990,
    category: "proteinas",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "12",
    name: "Glutamina Pura",
    description: "300g de L-Glutamina. Recuperación y sistema inmune.",
    price: 19990,
    category: "aminoacidos",
    image: "/placeholder.svg?height=300&width=300",
  },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
