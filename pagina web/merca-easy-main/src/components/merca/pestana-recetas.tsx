import { useState } from 'react'
import { AlertTriangle, Check, ChefHat, Clock, Plus, Sparkles, Wallet } from 'lucide-react'
import type { Tienda } from '@/data/productos'
import { RECETAS, type RecetaSugerida } from '@/lib/calculos'
import { formatearPesos } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { CampoPresupuesto } from './campo-presupuesto'
import { EtiquetaCanasta } from './etiqueta-canasta'
import { Modal, claseBotonPrincipal, claseBotonSecundario } from './modal'

type Props = {
  recetas: RecetaSugerida[]
  hayProductos: boolean
  presupuesto: number | null
  totalActual: number
  tiendaActual: Tienda
  onPresupuesto: (valor: number | null) => void
  onAgregarFaltantes: (productoIds: string[]) => void
  onIrAMercado: () => void
}

const GRUPOS = [
  {
    estado: 'preparar',
    titulo: 'Puedes preparar',
    descripcion: 'Ya tienes todos los ingredientes principales.',
  },
  {
    estado: 'casi',
    titulo: 'Casi puedes preparar',
    descripcion: 'Tienes al menos la mitad de los ingredientes principales.',
  },
  {
    estado: 'ajustes',
    titulo: 'Con pequeños ajustes',
    descripcion: 'Te faltan máximo tres productos; primero verás las opciones más económicas.',
  },
] as const

// Recetas dinámicas según el mercado, los precios disponibles y el presupuesto.
export function PestanaRecetas({
  recetas,
  hayProductos,
  presupuesto,
  totalActual,
  tiendaActual,
  onPresupuesto,
  onAgregarFaltantes,
  onIrAMercado,
}: Props) {
  const [recetaAbierta, setRecetaAbierta] = useState<string | null>(null)
  const detalle = recetas.find((receta) => receta.id === recetaAbierta) ?? null

  if (RECETAS.length === 0) {
    return <MensajeVacio titulo="Todavía no hay recetas cargadas" texto="Pronto verás aquí ideas para cocinar con tu mercado." />
  }

  if (!hayProductos) {
    return (
      <MensajeVacio
        titulo="Completa tu mercado para recibir recetas"
        texto="Agrega algunos productos y te diremos qué puedes cocinar, qué te falta y cuánto costaría completar cada receta."
        onIrAMercado={onIrAMercado}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-extrabold">Recetas para tu mercado</h2>
        <p className="text-muted-foreground">
          Calculamos cada faltante con su precio más bajo disponible. El ingrediente gancho es opcional.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CampoPresupuesto id="presupuesto-recetas" valor={presupuesto} onCambiar={onPresupuesto} />
        <section aria-label="Resumen del presupuesto" className="flex flex-col justify-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="flex items-center gap-2">
            <Wallet className="size-6 text-primary" aria-hidden="true" />
            <h3 className="text-xl font-extrabold">Tu dinero</h3>
          </div>
          <dl className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Mercado actual en {tiendaActual.nombre}</dt>
              <dd className="shrink-0 font-extrabold">{formatearPesos(totalActual)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
              <dt className="text-muted-foreground">Disponible</dt>
              <dd className={cn('shrink-0 text-lg font-extrabold', presupuesto !== null && presupuesto - totalActual < 0 && 'text-destructive')}>
                {presupuesto === null ? 'Define tu presupuesto' : formatearPesos(presupuesto - totalActual)}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {recetas.length === 0 ? (
        <MensajeVacio
          titulo="Agrega algunos ingredientes básicos"
          texto="Con arroz, granos, pollo, verduras, lácteos o panadería podremos mostrarte recetas cercanas a tu mercado."
          onIrAMercado={onIrAMercado}
        />
      ) : (
        GRUPOS.map((grupo) => {
          const delGrupo = recetas.filter((receta) => receta.estado === grupo.estado)
          if (delGrupo.length === 0) return null
          return (
            <section key={grupo.estado} aria-labelledby={`grupo-${grupo.estado}`} className="flex flex-col gap-3">
              <div>
                <h3 id={`grupo-${grupo.estado}`} className="text-xl font-extrabold">
                  {grupo.titulo} <span className="text-muted-foreground">({delGrupo.length})</span>
                </h3>
                <p className="text-muted-foreground">{grupo.descripcion}</p>
              </div>
              <ul className="flex flex-col gap-4">
                {delGrupo.map((receta) => (
                  <TarjetaReceta
                    key={receta.id}
                    receta={receta}
                    onVer={() => setRecetaAbierta(receta.id)}
                    onAgregar={() => onAgregarFaltantes(receta.faltan.map((producto) => producto.id))}
                  />
                ))}
              </ul>
            </section>
          )
        })
      )}

      {detalle && (
        <DetalleReceta
          receta={detalle}
          onCerrar={() => setRecetaAbierta(null)}
          onAgregar={() => onAgregarFaltantes(detalle.faltan.map((producto) => producto.id))}
        />
      )}
    </div>
  )
}

function TarjetaReceta({ receta, onVer, onAgregar }: { receta: RecetaSugerida; onVer: () => void; onAgregar: () => void }) {
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-xl font-extrabold leading-tight">{receta.nombre}</h4>
          <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm font-extrabold text-secondary-foreground">
            {receta.porcentaje}%
          </span>
        </div>
        <p className="flex items-center gap-2 font-bold text-muted-foreground">
          <Clock className="size-5" aria-hidden="true" />
          {receta.tiempoComida}
        </p>
        <div
          role="progressbar"
          aria-label={`Ingredientes disponibles para ${receta.nombre}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={receta.porcentaje}
          className="h-3 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${receta.porcentaje}%` }} />
        </div>
        <p className="text-sm font-bold text-muted-foreground">
          {receta.tiene.length} de {receta.ingredientes.length} ingredientes principales
        </p>
      </div>

      <ListaIngredientes receta={receta} />
      <IngredienteGancho receta={receta} />
      <EstadoEconomico receta={receta} />

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={onVer} className={claseBotonSecundario}>
          Ver preparación
        </button>
        {receta.faltan.length > 0 && (
          <button
            type="button"
            onClick={onAgregar}
            disabled={!receta.puedeAgregar}
            className={claseBotonPrincipal}
          >
            <Plus className="size-5" aria-hidden="true" />
            Agregar {receta.faltan.length} {receta.faltan.length === 1 ? 'faltante' : 'faltantes'}
          </button>
        )}
      </div>
    </li>
  )
}

function ListaIngredientes({ receta }: { receta: RecetaSugerida }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-secondary p-3">
        <p className="pb-2 font-extrabold">Ya tienes ({receta.tiene.length})</p>
        {receta.tiene.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {receta.tiene.map((producto) => (
              <li key={producto.id} className="flex items-start gap-2">
                <Check className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={3} aria-hidden="true" />
                <span className="font-bold">{producto.nombre}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Aún no tienes ingredientes principales.</p>
        )}
      </div>

      {receta.pendientes.length > 0 && (
        <div className="rounded-xl bg-destructive/10 p-3">
          <p className="pb-2 font-extrabold">Te faltan ({receta.pendientes.length})</p>
          <ul className="flex flex-col gap-3">
            {receta.pendientes.map(({ producto, mejorPrecio }) => (
              <li key={producto.id} className="flex flex-col gap-1">
                <span className="font-bold">{producto.nombre}</span>
                <span className="text-sm text-muted-foreground">
                  {mejorPrecio
                    ? `${formatearPesos(mejorPrecio.precio)} en ${mejorPrecio.tienda.nombre}`
                    : 'Sin precio disponible'}
                </span>
                {producto.canastaFamiliar && <EtiquetaCanasta />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function IngredienteGancho({ receta }: { receta: RecetaSugerida }) {
  if (!receta.gancho) return null
  return (
    <div className="flex items-start gap-2 rounded-xl bg-accent/40 p-3">
      <Sparkles className="mt-0.5 size-5 shrink-0 text-accent-foreground" aria-hidden="true" />
      <p>
        <span className="font-extrabold">
          {receta.ganchoEnLista ? 'Tienes el toque opcional: ' : 'Sugerencia opcional: '}
          {receta.gancho.producto.nombre}.
        </span>{' '}
        {receta.gancho.razon}
      </p>
    </div>
  )
}

function EstadoEconomico({ receta }: { receta: RecetaSugerida }) {
  const fuera = receta.viabilidad === 'fuera'
  return (
    <div className={cn('rounded-xl p-3', fuera ? 'bg-destructive/10' : 'bg-muted')}>
      <p className="text-lg font-extrabold">
        {receta.faltan.length === 0
          ? 'No necesitas comprar ingredientes principales adicionales.'
          : receta.costoCompleto
            ? `Costo adicional estimado: ${formatearPesos(receta.costoFaltantes)}`
            : 'No podemos calcular el costo adicional completo.'}
      </p>
      {receta.viabilidad === 'sin-presupuesto' && receta.faltan.length > 0 && (
        <p className="text-muted-foreground">Puedes agregar los faltantes; define un presupuesto para validar el gasto.</p>
      )}
      {receta.viabilidad === 'dentro' && receta.restante !== null && (
        <p className="font-bold text-primary">Después de completarla te quedarían {formatearPesos(receta.restante)}.</p>
      )}
      {fuera && (
        <p className="flex items-start gap-2 font-bold text-destructive">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          {receta.faltan.length === 0
            ? `Tu mercado actual supera el presupuesto por ${formatearPesos(receta.dineroAdicional)}.`
            : `Fuera del presupuesto: necesitarías ${formatearPesos(receta.dineroAdicional)} adicionales.`}
        </p>
      )}
      {receta.viabilidad === 'sin-precio' && (
        <p className="text-muted-foreground">Agrega los productos desde Mi mercado para comparar las tiendas disponibles.</p>
      )}
    </div>
  )
}

function DetalleReceta({ receta, onCerrar, onAgregar }: { receta: RecetaSugerida; onCerrar: () => void; onAgregar: () => void }) {
  return (
    <Modal titulo={receta.nombre} onCerrar={onCerrar}>
      <div className="flex max-h-[70dvh] flex-col gap-4 overflow-y-auto pr-1">
        <p className="flex items-center gap-2 font-bold text-muted-foreground">
          <Clock className="size-5" aria-hidden="true" />
          {receta.tiempoComida} · {receta.porcentaje}% disponible
        </p>
        <ListaIngredientes receta={receta} />
        <IngredienteGancho receta={receta} />
        <EstadoEconomico receta={receta} />
        <section aria-labelledby="titulo-preparacion">
          <h3 id="titulo-preparacion" className="pb-2 text-xl font-extrabold">Preparación paso a paso</h3>
          <ol className="flex flex-col gap-3">
            {receta.preparacion.map((paso, indice) => (
              <li key={paso} className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-extrabold text-primary-foreground">
                  {indice + 1}
                </span>
                <p>{paso}</p>
              </li>
            ))}
          </ol>
        </section>
        {receta.faltan.length > 0 && (
          <button type="button" onClick={onAgregar} disabled={!receta.puedeAgregar} className={claseBotonPrincipal}>
            <Plus className="size-5" aria-hidden="true" />
            Agregar {receta.faltan.length} {receta.faltan.length === 1 ? 'faltante' : 'faltantes'}
          </button>
        )}
      </div>
    </Modal>
  )
}

function MensajeVacio({ titulo, texto, onIrAMercado }: { titulo: string; texto: string; onIrAMercado?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-input bg-card p-8 text-center">
      <ChefHat className="size-12 text-muted-foreground" aria-hidden="true" />
      <p className="text-xl font-extrabold">{titulo}</p>
      <p className="text-muted-foreground text-pretty">{texto}</p>
      {onIrAMercado && (
        <button
          type="button"
          onClick={onIrAMercado}
          className="h-14 rounded-2xl bg-primary px-6 text-lg font-extrabold text-primary-foreground hover:opacity-90"
        >
          Ir a Mi mercado
        </button>
      )}
    </div>
  )
}
