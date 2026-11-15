import { Info, ShoppingBasket } from 'lucide-react'

// Encabezado con el nombre de la app y el aviso de precios de ejemplo.
export function Encabezado() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pb-4 pt-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand text-primary-foreground">
            <ShoppingBasket className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">Merca Fácil</h1>
            <p className="text-sm text-primary-foreground/85">Compara y ahorra en tu mercado</p>
          </div>
        </div>
        <p
          role="note"
          className="flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground"
        >
          <Info className="size-5 shrink-0" aria-hidden="true" />
          Precios de ejemplo, no son precios reales
        </p>
      </div>
    </header>
  )
}
