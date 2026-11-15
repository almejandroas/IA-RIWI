import { describe, expect, it } from 'vitest'
import { PRODUCTOS, PRODUCTOS_POR_ID } from '@/data/productos'
import { filtrarSugerencias } from '@/data/sugerencias'
import { RECETAS, calcularRanking, precioEnTienda, sugerirRecetas } from '@/lib/calculos'
import { agregarGuardado, type MercadoGuardado } from '@/lib/mis-mercados'

describe('reglas de Merca Fácil', () => {
  it('usa la marca más barata disponible en cada tienda', () => {
    const arroz = PRODUCTOS_POR_ID['PROD001']
    if (!arroz) throw new Error('Falta PROD001 en el catálogo')
    expect(precioEnTienda(arroz, 'D1')).toEqual({ precio: 4450, marca: 'Roa' })
    expect(precioEnTienda(arroz, 'Exito')).toEqual({ precio: 4900, marca: 'Diana' })
  })

  it('cuenta los productos que le faltan a cada tienda', () => {
    const ranking = calcularRanking([{ productoId: 'PROD003', cantidad: 2 }])
    expect(ranking.find((r) => r.tienda.id === 'D1')?.total).toBe(12_100)
    expect(ranking.find((r) => r.tienda.id === 'Exito')?.faltan).toBe(1)
    expect(ranking.find((r) => r.tienda.id === 'Jumbo')?.faltan).toBe(1)
  })

  it('incorpora los precios corregidos de Éxito y conserva sus referencias exclusivas', () => {
    const pasta = PRODUCTOS_POR_ID['PROD009']
    if (!pasta) throw new Error('Falta PROD009 en el catálogo')
    expect(precioEnTienda(pasta, 'D1')).toBeNull()
    expect(precioEnTienda(pasta, 'Jumbo')).toBeNull()
    expect(precioEnTienda(pasta, 'Exito')).toEqual({ precio: 5000, marca: 'Roa' })
    expect(PRODUCTOS.flatMap((p) => p.marcas).filter((m) => m.precios.Exito !== null)).toHaveLength(300)
  })

  it('sugiere mercados a ±100.000 del presupuesto', () => {
    const r = filtrarSugerencias([{ total: 150_000 }, { total: 310_000 }], 200_000)
    expect(r.lista).toEqual([{ total: 150_000 }])
    expect(r.fueraDeRango).toBe(false)
  })

  it('si ninguno entra, muestra los 2 más cercanos', () => {
    const r = filtrarSugerencias([{ total: 900_000 }, { total: 500_000 }, { total: 700_000 }], 100_000)
    expect(r.lista.map((m) => m.total)).toEqual([500_000, 700_000])
    expect(r.fueraDeRango).toBe(true)
  })

  it('guarda máximo 5 mercados y elimina el más antiguo', () => {
    const lista: MercadoGuardado[] = [1, 2, 3, 4, 5].map((n) => ({
      id: String(n), nombre: String(n), fecha: `2026-01-0${n}T00:00:00Z`, items: [],
    }))
    const r = agregarGuardado(lista, { id: '6', nombre: '6', fecha: '2026-02-01T00:00:00Z', items: [] })
    expect(r).toHaveLength(5)
    expect(r.map((m) => m.id)).not.toContain('1')
  })

  it('carga las 12 recetas y relaciona todos sus ingredientes por id', () => {
    expect(RECETAS).toHaveLength(12)
    expect(RECETAS.every((receta) => receta.ingredientes.length >= 4)).toBe(true)
  })

  it('marca una receta como preparable cuando tiene todos los ingredientes principales', () => {
    const ids = new Set(['PROD001', 'PROD023', 'PROD050', 'PROD048', 'PROD047'])
    const receta = sugerirRecetas(ids, null, 29_850).find((r) => r.id === 'REC001')!
    expect(receta.estado).toBe('preparar')
    expect(receta.porcentaje).toBe(100)
    expect(receta.faltan).toHaveLength(0)
  })

  it('identifica los faltantes y calcula su precio más bajo real', () => {
    const ids = new Set(['PROD001', 'PROD048', 'PROD047'])
    const receta = sugerirRecetas(ids, 30_000, 11_600).find((r) => r.id === 'REC001')!
    expect(receta.estado).toBe('casi')
    expect(receta.tiene.map((p) => p.id)).toEqual(['PROD001', 'PROD048', 'PROD047'])
    expect(receta.faltan.map((p) => p.id)).toEqual(['PROD023', 'PROD050'])
    expect(receta.costoFaltantes).toBe(18_250)
    expect(receta.restante).toBe(150)
    expect(receta.puedeAgregar).toBe(true)
  })

  it('advierte cuánto dinero adicional se necesita cuando la receta supera el presupuesto', () => {
    const ids = new Set(['PROD001', 'PROD048', 'PROD047'])
    const receta = sugerirRecetas(ids, 29_000, 11_600).find((r) => r.id === 'REC001')!
    expect(receta.viabilidad).toBe('fuera')
    expect(receta.dineroAdicional).toBe(850)
    expect(receta.puedeAgregar).toBe(false)
  })

  it('no exige el ingrediente gancho para poder preparar la receta', () => {
    const ids = new Set(['PROD001', 'PROD023', 'PROD050', 'PROD048', 'PROD047'])
    const receta = sugerirRecetas(ids, null, 29_850).find((r) => r.id === 'REC001')!
    expect(receta.gancho?.producto.id).toBe('PROD022')
    expect(receta.ganchoEnLista).toBe(false)
    expect(receta.costoFaltantes).toBe(0)
    expect(receta.estado).toBe('preparar')
  })

  it('actualiza los faltantes al quitar un ingrediente principal', () => {
    const ids = new Set(['PROD001', 'PROD023', 'PROD050', 'PROD048', 'PROD047'])
    ids.delete('PROD023')
    const receta = sugerirRecetas(ids, null, 14_250).find((r) => r.id === 'REC001')!
    expect(receta.estado).toBe('casi')
    expect(receta.faltan.map((p) => p.id)).toEqual(['PROD023'])
    expect(receta.costoFaltantes).toBe(15_600)
  })

  it('prioriza recetas con máximo tres ajustes aunque tengan pocos ingredientes', () => {
    const receta = sugerirRecetas(new Set(['PROD047']), null, 4_000).find((r) => r.id === 'REC012')!
    expect(receta.estado).toBe('ajustes')
    expect(receta.faltan).toHaveLength(3)
  })

  it('no inventa clasificación de canasta familiar cuando el catálogo no la proporciona', () => {
    const ids = new Set(['PROD001', 'PROD048', 'PROD047'])
    const receta = sugerirRecetas(ids, null, 11_600).find((r) => r.id === 'REC001')!
    expect(receta.pendientes.map((p) => p.producto.canastaFamiliar)).toEqual([false, false])
    expect(PRODUCTOS.filter((p) => p.canastaFamiliar)).toHaveLength(0)
  })
})
