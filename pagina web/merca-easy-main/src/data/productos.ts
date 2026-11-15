// Catálogo de Merca Fácil, leído de base_datos_supermercados.json.
// Precios de ejemplo en pesos colombianos (COP). null = esa marca no está en esa tienda.
import baseDatos from './base_datos_supermercados.json'

export type TiendaId = 'D1' | 'Exito' | 'Jumbo'

export type Tienda = {
  id: TiendaId
  nombre: string
}

export type Marca = {
  marca: string
  precios: Record<TiendaId, number | null>
}

export type Producto = {
  id: string
  nombre: string
  unidad: string
  categoriaId: string
  canastaFamiliar: boolean
  marcas: Marca[]
}

export type Categoria = {
  id: string
  nombre: string
  emoji: string
}

export const TIENDAS: Tienda[] = [
  { id: 'D1', nombre: 'D1' },
  { id: 'Exito', nombre: 'Éxito' },
  { id: 'Jumbo', nombre: 'Jumbo' },
]

const EMOJIS: Record<string, string> = {
  CAT001: '🌾',
  CAT002: '🥛',
  CAT003: '🍗',
  CAT004: '🍎',
  CAT005: '🥕',
  CAT006: '🫙',
  CAT007: '🍞',
  CAT008: '🧽',
  CAT009: '🧴',
  CAT010: '🧃',
}

type ProductoJson = {
  id_producto: string
  nombre: string
  presentacion: string
  canasta_familiar?: boolean
  marcas: { marca: string; precios: Record<string, number | null> }[]
}

const categoriasJson = baseDatos.categorias as unknown as {
  id_categoria: string
  nombre: string
  productos: ProductoJson[]
}[]

export const CATEGORIAS: Categoria[] = categoriasJson.map((c) => ({
  id: c.id_categoria,
  nombre: c.nombre,
  emoji: EMOJIS[c.id_categoria] ?? '🛒',
}))

export const PRODUCTOS: Producto[] = categoriasJson.flatMap((c) =>
  c.productos.map((p) => ({
    id: p.id_producto,
    nombre: p.nombre,
    unidad: p.presentacion.replace(/\s+/g, ' '),
    categoriaId: c.id_categoria,
    canastaFamiliar: p.canasta_familiar === true,
    marcas: p.marcas.map((m) => ({
      marca: m.marca,
      precios: {
        D1: m.precios['D1'] ?? null,
        Exito: m.precios['Exito'] ?? null,
        Jumbo: m.precios['Jumbo'] ?? null,
      },
    })),
  })),
)

export const PRODUCTOS_POR_ID: Record<string, Producto> = Object.fromEntries(
  PRODUCTOS.map((producto) => [producto.id, producto]),
)
