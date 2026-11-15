import { useMemo, useState } from 'react'
import { ChevronDown, Info, Lightbulb } from 'lucide-react'
import { PRODUCTOS_POR_ID } from '@/data/productos'
import { SUGERENCIAS, filtrarSugerencias, type MercadoSugerido } from '@/data/sugerencias'
import { calcularRanking, type ItemLista } from '@/lib/calculos'
import { formatearPesos } from '@/lib/formato'
import { CampoPresupuesto } from './campo-presupuesto'
import { claseBotonPrincipal, claseBotonSecundario } from './modal'

type Props = {
  presupuesto: number | null
  onPresupuesto: (valor: number | null) => void
  onUsar: (items: ItemLista[]) => void
}

export function PestanaSugerencias({ presupuesto, onPresupuesto, onUsar }: Props) {
  const conTotales = useMemo(
    () =>
      SUGERENCIAS.map((m) => {
        const recomendada = calcularRanking(m.items)[0]!
        return { ...m, total: recomendada.total, tienda: recomendada.tienda.nombre }
      }),
    [],
  )

  if (!presupuesto) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-input bg-card p-6 text-center">
          <Lightbulb className="size-12 text-muted-foreground" aria-hidden="true" />
          <p className="text-xl font-extrabold">Ingresa tu presupuesto para ver sugerencias</p>
        </div>
        <CampoPresupuesto valor={presupuesto} onCambiar={onPresupuesto} />
      </div>
    )
  }

  const { lista, fueraDeRango } = filtrarSugerencias(conTotales, presupuesto)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold">Mercados para tu presupuesto de {formatearPesos(presupuesto)}</h2>
      {fueraDeRango && (
        <p role="status" className="flex items-start gap-2 rounded-2xl bg-accent p-4 font-bold text-accent-foreground">
          <Info className="size-6 shrink-0" aria-hidden="true" />
          Ningún mercado queda cerca de tu presupuesto (±$100.000). Te mostramos los 2 más cercanos.
        </p>
      )}
      <ul className="grid gap-4 md:grid-cols-2">
        {lista.map((m) => (
          <TarjetaSugerencia key={m.id} mercado={m} onUsar={() => onUsar(m.items)} />
        ))}
      </ul>
    </div>
  )
}

function TarjetaSugerencia({
  mercado,
  onUsar,
}: {
  mercado: MercadoSugerido & { total: number; tienda: string }
  onUsar: () => void
}) {
  const [abierta, setAbierta] = useState(false)
  return (
    <li className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h3 className="text-xl font-extrabold leading-tight">{mercado.nombre}</h3>
        <p className="text-muted-foreground">{mercado.descripcion}</p>
      </div>
      <p className="text-muted-foreground">{mercado.items.length} productos</p>
      <div>
        <p className="text-3xl font-extrabold text-primary">{formatearPesos(mercado.total)}</p>
        <p className="font-bold">en {mercado.tienda}</p>
      </div>
      <button type="button" onClick={() => setAbierta((v) => !v)} aria-expanded={abierta} className={claseBotonSecundario}>
        Ver productos
        <ChevronDown className={`size-5 transition-transform ${abierta ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {abierta && (
        <ul className="flex flex-col divide-y divide-border rounded-2xl bg-background px-3">
          {mercado.items.map((i) => (
            <li key={i.productoId} className="flex justify-between gap-2 py-2">
              <span>{PRODUCTOS_POR_ID[i.productoId]?.nombre ?? i.productoId}</span>
              <span className="font-extrabold">× {i.cantidad}</span>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={onUsar} className={claseBotonPrincipal}>
        Usar este mercado
      </button>
    </li>
  )
}
