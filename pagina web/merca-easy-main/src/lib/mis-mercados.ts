import type { ItemLista } from '@/lib/calculos'

// Mercados guardados en el navegador. Solo id_producto y cantidad (sin precios).
export type MercadoGuardado = {
  id: string
  nombre: string
  fecha: string // ISO
  items: ItemLista[]
}

export const CLAVE_MIS_MERCADOS = 'merca-facil:mis-mercados'
export const MAXIMO_GUARDADOS = 5

export function leerGuardados(): MercadoGuardado[] {
  try {
    const crudo = localStorage.getItem(CLAVE_MIS_MERCADOS)
    const lista = crudo ? JSON.parse(crudo) : []
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

export function escribirGuardados(lista: MercadoGuardado[]) {
  localStorage.setItem(CLAVE_MIS_MERCADOS, JSON.stringify(lista))
}

export function nombrePorDefecto(fecha = new Date()) {
  return `Mercado del ${fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`
}

// Agrega un mercado nuevo al inicio. Si pasa de 5, elimina el más antiguo.
export function agregarGuardado(lista: MercadoGuardado[], nuevo: MercadoGuardado): MercadoGuardado[] {
  const ordenada = [nuevo, ...lista].sort((a, b) => b.fecha.localeCompare(a.fecha))
  return ordenada.slice(0, MAXIMO_GUARDADOS)
}

export function firmaItems(items: ItemLista[]) {
  return items.map((i) => `${i.productoId}:${i.cantidad}`).join(',')
}
