// Mercados sugeridos. Formato: id_producto:cantidad (en presentaciones).
import type { ItemLista } from '@/lib/calculos'

export type MercadoSugerido = {
  id: string
  nombre: string
  descripcion: string
  items: ItemLista[]
}

function leer(texto: string): ItemLista[] {
  return texto
    .split(',')
    .map((par) => par.trim())
    .filter(Boolean)
    .map((par) => {
      const [productoId = '', cantidad] = par.split(':')
      return { productoId: productoId.trim(), cantidad: Number(cantidad) || 1 }
    })
}

export const SUGERENCIAS: MercadoSugerido[] = [
  {
    id: 'express',
    nombre: 'Mercado express',
    descripcion: '1-2 personas, 1 semana',
    items: leer('PROD001:1, PROD005:1, PROD045:2, PROD047:1, PROD048:1, PROD050:1, PROD023:1, PROD012:3, PROD034:1, PROD059:1'),
  },
  {
    id: 'basico-familiar',
    nombre: 'Mercado básico familiar',
    descripcion: '4 personas, 1 semana',
    items: leer('PROD001:3, PROD004:1, PROD005:1, PROD056:1, PROD058:1, PROD059:1, PROD061:1, PROD045:3, PROD047:2, PROD048:2, PROD050:2, PROD055:1, PROD023:2, PROD012:6, PROD034:2, PROD036:1, PROD069:2, PROD063:1'),
  },
  {
    id: '15-ahorro',
    nombre: 'Mercado de 15 días, ahorro',
    descripcion: '4 personas, lo esencial',
    items: leer('PROD001:3, PROD004:1, PROD005:1, PROD010:1, PROD056:1, PROD058:1, PROD059:1, PROD061:1, PROD045:3, PROD047:2, PROD048:2, PROD050:2, PROD055:1, PROD023:2, PROD024:1, PROD025:1, PROD012:8, PROD017:1, PROD034:2, PROD036:1, PROD069:2, PROD063:1, PROD079:1, PROD089:1'),
  },
  {
    id: '15-completo',
    nombre: 'Mercado de 15 días, completo',
    descripcion: '4 personas, con aseo',
    items: leer('PROD001:4, PROD004:2, PROD005:2, PROD010:2, PROD056:2, PROD058:2, PROD059:2, PROD061:2, PROD045:4, PROD046:1, PROD047:3, PROD048:3, PROD050:2, PROD055:2, PROD023:3, PROD024:2, PROD025:2, PROD012:10, PROD017:1, PROD034:3, PROD036:2, PROD069:3, PROD063:1, PROD062:1, PROD079:1, PROD089:1'),
  },
  {
    id: 'mes-familiar',
    nombre: 'Mercado del mes, familiar',
    descripcion: '4 personas, carnes y desayunos',
    items: leer('PROD001:4, PROD004:2, PROD005:2, PROD007:2, PROD056:2, PROD058:2, PROD059:2, PROD061:2, PROD045:5, PROD046:1, PROD047:3, PROD048:3, PROD050:2, PROD051:2, PROD053:1, PROD023:4, PROD024:3, PROD025:3, PROD027:2, PROD029:2, PROD033:2, PROD012:12, PROD017:2, PROD021:1, PROD034:3, PROD036:3, PROD038:2, PROD067:2, PROD069:4, PROD063:2, PROD062:1, PROD104:2'),
  },
  {
    id: 'mes-grande',
    nombre: 'Mercado del mes, grande',
    descripcion: '5-6 personas, con aseo',
    items: leer('PROD001:5, PROD004:2, PROD005:2, PROD007:1, PROD010:2, PROD056:2, PROD058:2, PROD059:2, PROD061:2, PROD064:1, PROD045:5, PROD046:1, PROD047:3, PROD048:3, PROD050:2, PROD051:1, PROD053:1, PROD055:2, PROD023:4, PROD024:3, PROD025:3, PROD027:2, PROD029:2, PROD031:2, PROD033:1, PROD012:14, PROD017:2, PROD021:1, PROD034:3, PROD035:2, PROD036:3, PROD038:2, PROD067:2, PROD069:4, PROD063:2, PROD062:1, PROD104:2, PROD100:2, PROD078:1, PROD082:1, PROD087:1, PROD089:2, PROD090:1, PROD094:1'),
  },
]

// Mercados cuyo total en la tienda recomendada está a ±100.000 del presupuesto.
// Si ninguno entra, devuelve los 2 más cercanos y marca fueraDeRango.
export const MARGEN_SUGERENCIAS = 100_000

export function filtrarSugerencias<T extends { total: number }>(
  mercados: T[],
  presupuesto: number,
): { lista: T[]; fueraDeRango: boolean } {
  const enRango = mercados.filter((m) => Math.abs(m.total - presupuesto) <= MARGEN_SUGERENCIAS)
  if (enRango.length > 0) return { lista: enRango, fueraDeRango: false }
  const cercanos = [...mercados]
    .sort((a, b) => Math.abs(a.total - presupuesto) - Math.abs(b.total - presupuesto))
    .slice(0, 2)
  return { lista: cercanos, fueraDeRango: true }
}
