import { ArrowRight, Minus, Plus, Save, ShoppingBasket, Trash2 } from 'lucide-react'
import { PRODUCTOS_POR_ID, TIENDAS } from '@/data/productos'
import { precioEnTienda, type ItemLista, type TotalTienda } from '@/lib/calculos'
import { formatearPesos } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { CampoPresupuesto } from './campo-presupuesto'
import { EstadoPresupuesto } from './estado-presupuesto'
import { EtiquetaCanasta } from './etiqueta-canasta'

type Props = {
  items: ItemLista[]
  ranking: TotalTienda[]
  presupuesto: number | null
  onPresupuesto: (valor: number | null) => void
  onCambiarCantidad: (productoId: string, cambio: number) => void
  onQuitar: (productoId: string) => void
  onVerResultado: () => void
  onGuardar: () => void
}

// La lista: productos con su precio en cada tienda, fila Total, presupuesto y su mensaje.
export function PanelLista({
  items,
  ranking,
  presupuesto,
  onPresupuesto,
  onCambiarCantidad,
  onQuitar,
  onVerResultado,
  onGuardar,
}: Props) {
  const recomendada = ranking[0]!
  const hayProductos = items.length > 0

  return (
    <div className="flex flex-col gap-5">
      <section aria-labelledby="titulo-lista" className="flex flex-col gap-3">
        <h2 id="titulo-lista" className="text-2xl font-extrabold">
          Mi lista {hayProductos && <span className="text-muted-foreground">({items.length})</span>}
        </h2>

        {!hayProductos ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-input bg-card p-6 text-center">
            <ShoppingBasket className="size-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-lg font-bold">Tu lista está vacía</p>
            <p className="text-muted-foreground">Busca un producto o elige una categoría para empezar.</p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <ItemConPrecios
                  key={item.productoId}
                  item={item}
                  onCambiarCantidad={onCambiarCantidad}
                  onQuitar={onQuitar}
                />
              ))}
            </ul>

            <div className="rounded-2xl border-2 border-primary bg-card p-3">
              <p className="pb-2 text-lg font-extrabold">Total</p>
              <div className="grid grid-cols-3 gap-2">
                {TIENDAS.map((tienda) => {
                  const fila = ranking.find((r) => r.tienda.id === tienda.id)!
                  const esRecomendada = fila.tienda.id === recomendada.tienda.id
                  return (
                    <div
                      key={tienda.id}
                      className={cn(
                        'flex flex-col rounded-xl p-2',
                        esRecomendada ? 'bg-primary text-primary-foreground' : 'bg-muted',
                      )}
                    >
                      <span className="text-sm font-bold">{tienda.nombre}</span>
                      <span className="font-extrabold">{formatearPesos(fila.total)}</span>
                      {fila.faltan > 0 && (
                        <span className={cn('text-xs font-bold', esRecomendada ? 'opacity-90' : 'text-destructive')}>
                          Le faltan {fila.faltan}
                        </span>
                      )}
                      {esRecomendada && <span className="text-xs font-bold">Recomendada</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </section>

      <CampoPresupuesto valor={presupuesto} onCambiar={onPresupuesto} />

      <EstadoPresupuesto
        hayProductos={hayProductos}
        presupuesto={presupuesto}
        totalMasBarato={recomendada.total}
        nombreTienda={recomendada.tienda.nombre}
      />

      {hayProductos && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onVerResultado}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-extrabold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ver dónde me sale más barato
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onGuardar}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-card text-lg font-extrabold text-primary transition-colors hover:bg-secondary"
          >
            <Save className="size-5" aria-hidden="true" />
            Guardar mercado
          </button>
        </div>
      )}
    </div>
  )
}

function ItemConPrecios({
  item,
  onCambiarCantidad,
  onQuitar,
}: {
  item: ItemLista
  onCambiarCantidad: (productoId: string, cambio: number) => void
  onQuitar: (productoId: string) => void
}) {
  const producto = PRODUCTOS_POR_ID[item.productoId]
  if (!producto) return null

  const precios = TIENDAS.map((tienda) => {
    const p = precioEnTienda(producto, tienda.id)
    return { tienda, total: p ? p.precio * item.cantidad : null, marca: p?.marca }
  })
  const disponibles = precios.filter((p) => p.total != null).map((p) => p.total as number)
  const minimo = disponibles.length ? Math.min(...disponibles) : null

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-extrabold leading-tight">{producto.nombre}</p>
          <p className="text-sm text-muted-foreground">{producto.unidad}</p>
          {producto.canastaFamiliar && <EtiquetaCanasta />}
        </div>
        <button
          type="button"
          onClick={() => onQuitar(producto.id)}
          className="flex shrink-0 items-center gap-1 rounded-xl px-2 py-1 font-bold text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-5" aria-hidden="true" />
          Quitar
          <span className="sr-only"> {producto.nombre}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Cantidad</span>
        <button
          type="button"
          onClick={() => onCambiarCantidad(producto.id, -1)}
          disabled={item.cantidad <= 1}
          aria-label={`Quitar una unidad de ${producto.nombre}`}
          className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground hover:bg-success-soft disabled:opacity-40"
        >
          <Minus className="size-5" aria-hidden="true" />
        </button>
        <output aria-live="polite" className="min-w-8 text-center text-xl font-extrabold">
          {item.cantidad}
        </output>
        <button
          type="button"
          onClick={() => onCambiarCantidad(producto.id, 1)}
          aria-label={`Agregar una unidad de ${producto.nombre}`}
          className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {precios.map(({ tienda, total, marca }) => {
          const masBarato = total != null && total === minimo
          return (
            <div
              key={tienda.id}
              className={cn(
                'flex flex-col rounded-xl border p-2',
                masBarato ? 'border-success bg-success-soft' : 'border-border bg-background',
              )}
            >
              <span className="text-xs font-bold text-muted-foreground">{tienda.nombre}</span>
              {total != null ? (
                <>
                  <span className={cn('font-extrabold', masBarato && 'text-primary')}>{formatearPesos(total)}</span>
                  <span className="truncate text-xs text-muted-foreground">{marca}</span>
                </>
              ) : (
                <span className="text-sm font-bold text-muted-foreground">No disponible</span>
              )}
            </div>
          )
        })}
      </div>
    </li>
  )
}
