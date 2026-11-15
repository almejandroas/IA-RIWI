import { useEffect, useRef } from 'react'
import { Check, Plus } from 'lucide-react'
import { CATEGORIAS } from '@/data/productos'
import { precioMasBajo, productosDeCategoria } from '@/lib/calculos'
import { formatearPesos } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { EtiquetaCanasta } from './etiqueta-canasta'

type Props = {
  seleccionada: string | null
  onSeleccionar: (id: string | null) => void
  idsEnLista: Set<string>
  onAgregar: (productoId: string) => void
}

// Categorías como cuadritos (2 por fila en celular, 5 en computador) y sus productos.
export function Categorias({ seleccionada, onSeleccionar, idsEnLista, onAgregar }: Props) {
  const categoria = CATEGORIAS.find((c) => c.id === seleccionada)
  const panelProductos = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!seleccionada) return
    const marco = requestAnimationFrame(() => {
      panelProductos.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(marco)
  }, [seleccionada])

  return (
    <section aria-labelledby="titulo-categorias" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 id="titulo-categorias" className="text-xl font-extrabold">
          Busca por categoría
        </h2>
        <button
          type="button"
          onClick={() => onSeleccionar(null)}
          aria-pressed={seleccionada === null}
          className={cn(
            'rounded-full px-4 py-1.5 font-bold transition-colors',
            seleccionada === null ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-success-soft',
          )}
        >
          Todas
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {CATEGORIAS.map((c) => {
          const activa = c.id === seleccionada
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(activa ? null : c.id)}
                aria-pressed={activa}
                className={cn(
                  'flex h-full min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-card p-3 text-center font-bold leading-tight transition-colors',
                  activa ? 'border-brand bg-secondary text-primary' : 'border-border hover:border-brand/50',
                )}
              >
                <span
                  className={cn('flex size-12 items-center justify-center rounded-full text-2xl', activa ? 'bg-brand' : 'bg-secondary')}
                  aria-hidden="true"
                >
                  {c.emoji}
                </span>
                {c.nombre}
              </button>
            </li>
          )
        })}
      </ul>

      {categoria && (
        <div
          ref={panelProductos}
          id={`productos-${categoria.id}`}
          className="flex scroll-mt-6 flex-col rounded-3xl border border-border bg-card p-4 shadow-sm md:scroll-mt-24"
        >
          <div className="flex items-center justify-between gap-3 pb-2">
            <h3 className="text-lg font-extrabold">{categoria.nombre}</h3>
            <button type="button" onClick={() => onSeleccionar(null)} className="font-bold text-primary hover:underline">
              Cerrar
            </button>
          </div>
          <ul className="flex flex-col">
            {productosDeCategoria(categoria.id).map((producto) => {
              const yaEsta = idsEnLista.has(producto.id)
              const mejor = precioMasBajo(producto)
              return (
                <li key={producto.id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-bold leading-tight">{producto.nombre}</span>
                    <span className="text-muted-foreground">
                      {producto.unidad}
                      {mejor && ` · Desde ${formatearPesos(mejor.precio)} en ${mejor.tienda.nombre}`}
                    </span>
                    {producto.canastaFamiliar && <EtiquetaCanasta />}
                  </div>
                  {yaEsta ? (
                    <span className="flex shrink-0 items-center gap-1 font-bold text-muted-foreground">
                      <Check className="size-5" aria-hidden="true" />
                      En tu lista
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAgregar(producto.id)}
                      aria-label={`Agregar ${producto.nombre}`}
                      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground transition-opacity hover:opacity-90"
                    >
                      <Plus className="size-6" aria-hidden="true" />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
