import { PRODUCTOS, PRODUCTOS_POR_ID, TIENDAS, type Producto, type Tienda, type TiendaId } from '@/data/productos'
import { RECETAS_ARCHIVO } from '@/data/recetas'
import { normalizarTexto } from '@/lib/formato'

export type ItemLista = {
  productoId: string
  cantidad: number
}

export type TotalTienda = {
  tienda: Tienda
  total: number
  faltan: number
}

// ---------- Reglas de precio ----------

// Precio de un producto en una tienda: la marca más barata disponible allí. null si no lo tiene.
export function precioEnTienda(producto: Producto, tiendaId: TiendaId): { precio: number; marca: string } | null {
  let mejor: { precio: number; marca: string } | null = null
  for (const m of producto.marcas) {
    const precio = m.precios[tiendaId]
    if (precio != null && (!mejor || precio < mejor.precio)) mejor = { precio, marca: m.marca }
  }
  return mejor
}

// El precio más bajo entre todas las tiendas.
export function precioMasBajo(producto: Producto): { precio: number; tienda: Tienda } | null {
  let mejor: { precio: number; tienda: Tienda } | null = null
  for (const tienda of TIENDAS) {
    const p = precioEnTienda(producto, tienda.id)
    if (p && (!mejor || p.precio < mejor.precio)) mejor = { precio: p.precio, tienda }
  }
  return mejor
}

// ---------- Totales por tienda ----------

// Suma el mercado en cada tienda. Orden: primero la que tiene menos productos faltantes,
// luego la más barata. La primera es la tienda recomendada.
export function calcularRanking(items: ItemLista[]): TotalTienda[] {
  return TIENDAS.map((tienda) => {
    let total = 0
    let faltan = 0
    for (const item of items) {
      const producto = PRODUCTOS_POR_ID[item.productoId]
      if (!producto) continue
      const p = precioEnTienda(producto, tienda.id)
      if (p) total += p.precio * item.cantidad
      else faltan += 1
    }
    return { tienda, total, faltan }
  }).sort((a, b) => a.faltan - b.faltan || a.total - b.total)
}

// ---------- Buscador ----------

export function buscarProductos(consulta: string): Producto[] {
  const texto = normalizarTexto(consulta)
  if (!texto) return []
  return PRODUCTOS.filter((producto) => normalizarTexto(producto.nombre).includes(texto))
}

export function productosDeCategoria(categoriaId: string): Producto[] {
  return PRODUCTOS.filter((p) => p.categoriaId === categoriaId)
}

// Productos que aún no están en la lista, primero los de canasta familiar.
export function sugerirProductos(idsEnLista: Set<string>, limite = 6): Producto[] {
  return PRODUCTOS.filter((producto) => !idsEnLista.has(producto.id))
    .sort((a, b) => Number(b.canastaFamiliar) - Number(a.canastaFamiliar))
    .slice(0, limite)
}

// Une dos listas sumando cantidades de los productos repetidos.
export function combinarListas(actual: ItemLista[], nueva: ItemLista[]): ItemLista[] {
  const resultado = actual.map((i) => ({ ...i }))
  for (const item of nueva) {
    const existente = resultado.find((i) => i.productoId === item.productoId)
    if (existente) existente.cantidad += item.cantidad
    else resultado.push({ ...item })
  }
  return resultado
}

// ---------- Recetas ----------

export type Receta = {
  id: string
  nombre: string
  tiempoComida: string
  categorias: string[]
  ingredientes: Producto[]
  gancho: { producto: Producto; razon: string } | null
  preparacion: string[]
}

// Convierte la base cargada usando exclusivamente los identificadores del catálogo.
export const RECETAS: Receta[] = RECETAS_ARCHIVO.map((receta) => {
  const ingredientes = receta.ingredientes_principales
    .map((ingrediente) => PRODUCTOS_POR_ID[ingrediente.id_producto])
    .filter((producto): producto is Producto => Boolean(producto))
  const productoGancho = receta.ingrediente_gancho
    ? PRODUCTOS_POR_ID[receta.ingrediente_gancho.id_producto]
    : undefined

  return {
    id: receta.id_receta,
    nombre: receta.nombre,
    tiempoComida: receta.tiempo_comida,
    categorias: receta.categoria_base,
    ingredientes,
    gancho: productoGancho && receta.ingrediente_gancho
      ? { producto: productoGancho, razon: receta.ingrediente_gancho.razon }
      : null,
    preparacion: receta.preparacion,
  }
}).filter((receta) => receta.ingredientes.length > 0)

export type EstadoReceta = 'preparar' | 'casi' | 'ajustes'
export type ViabilidadReceta = 'sin-presupuesto' | 'dentro' | 'fuera' | 'sin-precio'

export type IngredientePendiente = {
  producto: Producto
  mejorPrecio: { precio: number; tienda: Tienda } | null
}

export type RecetaSugerida = Receta & {
  estado: EstadoReceta
  tiene: Producto[]
  faltan: Producto[]
  pendientes: IngredientePendiente[]
  porcentaje: number
  ganchoEnLista: boolean
  costoFaltantes: number
  costoCompleto: boolean
  viabilidad: ViabilidadReceta
  restante: number | null
  dineroAdicional: number
  puedeAgregar: boolean
}

// Compara el mercado con cada receta. Los faltantes cuestan una unidad y usan
// su menor precio disponible; el gancho nunca entra en ese cálculo.
export function sugerirRecetas(
  idsEnLista: Set<string>,
  presupuesto: number | null,
  totalActual: number,
): RecetaSugerida[] {
  if (idsEnLista.size === 0) return []

  const disponible = presupuesto === null ? null : presupuesto - totalActual
  const ordenEstado: Record<EstadoReceta, number> = { preparar: 0, casi: 1, ajustes: 2 }

  return RECETAS.map((receta) => {
    const tiene = receta.ingredientes.filter((producto) => idsEnLista.has(producto.id))
    const pendientes = receta.ingredientes
      .filter((producto) => !idsEnLista.has(producto.id))
      .map((producto) => ({ producto, mejorPrecio: precioMasBajo(producto) }))
    const faltan = pendientes.map((pendiente) => pendiente.producto)
    const porcentaje = Math.round((tiene.length / receta.ingredientes.length) * 100)

    let estado: EstadoReceta | null = null
    if (faltan.length === 0) estado = 'preparar'
    else if (porcentaje >= 50) estado = 'casi'
    else if (faltan.length <= 3) estado = 'ajustes'
    if (!estado) return null

    const costoCompleto = pendientes.every((pendiente) => pendiente.mejorPrecio !== null)
    const costoFaltantes = pendientes.reduce(
      (suma, pendiente) => suma + (pendiente.mejorPrecio?.precio ?? 0),
      0,
    )
    const restante = disponible !== null && costoCompleto ? disponible - costoFaltantes : null
    const viabilidad: ViabilidadReceta = !costoCompleto
      ? 'sin-precio'
      : presupuesto === null
        ? 'sin-presupuesto'
        : restante !== null && restante >= 0
          ? 'dentro'
          : 'fuera'

    return {
      ...receta,
      estado,
      tiene,
      faltan,
      pendientes,
      porcentaje,
      ganchoEnLista: receta.gancho ? idsEnLista.has(receta.gancho.producto.id) : false,
      costoFaltantes,
      costoCompleto,
      viabilidad,
      restante,
      dineroAdicional: restante !== null ? Math.max(0, -restante) : 0,
      puedeAgregar: faltan.length > 0 && costoCompleto && (restante === null || restante >= 0),
    }
  })
    .filter((receta): receta is RecetaSugerida => receta !== null)
    .sort((a, b) => {
      if (a.estado !== b.estado) return ordenEstado[a.estado] - ordenEstado[b.estado]
      if (a.estado === 'preparar') return a.nombre.localeCompare(b.nombre, 'es')
      if (a.puedeAgregar !== b.puedeAgregar) return Number(b.puedeAgregar) - Number(a.puedeAgregar)
      if (a.estado === 'ajustes') return a.costoFaltantes - b.costoFaltantes || a.faltan.length - b.faltan.length
      return a.faltan.length - b.faltan.length || a.costoFaltantes - b.costoFaltantes
    })
}
