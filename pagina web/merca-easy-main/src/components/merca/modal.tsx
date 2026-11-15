import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

// Ventana sencilla centrada, se cierra con Escape o tocando afuera.
export function Modal({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: ReactNode }) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay p-4" onClick={onCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-4 rounded-3xl bg-card p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-extrabold">{titulo}</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="flex size-10 items-center justify-center rounded-full hover:bg-muted">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const claseBotonPrincipal =
  'flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-lg font-extrabold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50'
export const claseBotonSecundario =
  'flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-card px-4 text-lg font-extrabold text-primary transition-colors hover:bg-secondary'
export const claseBotonTexto =
  'flex h-12 w-full items-center justify-center rounded-2xl px-4 text-lg font-bold text-muted-foreground hover:bg-muted'
