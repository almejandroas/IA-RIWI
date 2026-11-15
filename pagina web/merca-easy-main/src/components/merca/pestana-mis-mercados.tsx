import { Bookmark, Trash2 } from 'lucide-react'
import { calcularRanking } from '@/lib/calculos'
import { formatearPesos } from '@/lib/formato'
import type { MercadoGuardado } from '@/lib/mis-mercados'
import { claseBotonPrincipal } from './modal'

type Props = {
  guardados: MercadoGuardado[]
  onCargar: (mercado: MercadoGuardado) => void
  onEliminar: (id: string) => void
}

export function PestanaMisMercados({ guardados, onCargar, onEliminar }: Props) {
  if (guardados.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-input bg-card p-8 text-center">
        <Bookmark className="size-12 text-muted-foreground" aria-hidden="true" />
        <p className="text-xl font-extrabold">Todavía no has guardado mercados</p>
        <p className="text-muted-foreground">Usa “Guardar mercado” en tu lista para verlo aquí.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-extrabold">Mis mercados</h2>
      <ul className="grid gap-4 md:grid-cols-2">
        {guardados.map((m) => {
          const recomendada = calcularRanking(m.items)[0]!
          return (
            <li key={m.id} className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div>
                <h3 className="text-xl font-extrabold leading-tight">{m.nombre}</h3>
                <p className="text-muted-foreground">
                  {new Date(m.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
                  {m.items.length} productos
                </p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-primary">{formatearPesos(recomendada.total)}</p>
                <p className="font-bold">en {recomendada.tienda.nombre}</p>
              </div>
              <button type="button" onClick={() => onCargar(m)} className={claseBotonPrincipal}>
                Cargar para modificar
              </button>
              <button
                type="button"
                onClick={() => onEliminar(m.id)}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl font-bold text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-5" aria-hidden="true" />
                Eliminar
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
