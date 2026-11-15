import { Bookmark, ChefHat, Lightbulb, ShoppingCart, Trophy, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Pestana = 'mercado' | 'resultado' | 'recetas' | 'sugerencias' | 'mis-mercados'

type Props = {
  pestanaActiva: Pestana
  onCambiar: (pestana: Pestana) => void
  cantidadProductos: number
  cantidadRecetas: number
}

// Navegación entre pestañas: abajo en celular (nombre corto), arriba en pantallas grandes.
export function NavegacionPestanas({ pestanaActiva, onCambiar, cantidadProductos, cantidadRecetas }: Props) {
  const pestanas: { id: Pestana; etiqueta: string; corta: string; icono: LucideIcon; contador?: number }[] = [
    { id: 'mercado', etiqueta: 'Mi mercado', corta: 'Mercado', icono: ShoppingCart, contador: cantidadProductos },
    { id: 'resultado', etiqueta: 'Resultado', corta: 'Resultado', icono: Trophy },
    { id: 'recetas', etiqueta: 'Recetas', corta: 'Recetas', icono: ChefHat, contador: cantidadRecetas },
    { id: 'sugerencias', etiqueta: 'Sugerencias', corta: 'Ideas', icono: Lightbulb },
    { id: 'mis-mercados', etiqueta: 'Mis mercados', corta: 'Guardados', icono: Bookmark },
  ]

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:sticky md:top-0 md:bottom-auto md:border-b md:border-t-0"
    >
      <ul className="mx-auto grid w-full max-w-7xl grid-cols-5 md:px-4">
        {pestanas.map(({ id, etiqueta, corta, icono: Icono, contador }) => {
          const activa = pestanaActiva === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onCambiar(id)}
                aria-current={activa ? 'page' : undefined}
                className={cn(
                  'relative flex w-full flex-col items-center gap-0.5 py-2 text-xs font-bold transition-colors md:flex-row md:justify-center md:gap-2 md:py-4 md:text-base',
                  activa ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  activa && 'md:after:absolute md:after:inset-x-2 md:after:bottom-0 md:after:h-1 md:after:rounded-full md:after:bg-brand',
                )}
              >
                <span
                  className={cn(
                    'relative flex h-8 w-12 items-center justify-center rounded-full transition-colors md:h-auto md:w-auto',
                    activa && 'bg-secondary md:bg-transparent',
                  )}
                >
                  <Icono className="size-6" aria-hidden="true" />
                  {contador ? (
                    <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-extrabold text-primary-foreground md:hidden">
                      {contador}
                    </span>
                  ) : null}
                </span>
                <span className="md:hidden">{corta}</span>
                <span className="hidden md:inline">{etiqueta}</span>
                {contador ? (
                  <span className="hidden rounded-full bg-primary px-2 text-xs font-extrabold text-primary-foreground md:inline">
                    {contador}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
