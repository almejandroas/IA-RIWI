import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Categorias } from '@/components/merca/categorias'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('navegación por categorías', () => {
  it('desplaza suavemente hasta el título y los productos de la categoría elegida', async () => {
    const desplazar = vi.fn()
    Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: desplazar })
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    const { rerender } = render(
      <Categorias seleccionada={null} onSeleccionar={() => {}} idsEnLista={new Set()} onAgregar={() => {}} />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Granos y cereales/ }))
    rerender(
      <Categorias seleccionada="CAT001" onSeleccionar={() => {}} idsEnLista={new Set()} onAgregar={() => {}} />,
    )

    await waitFor(() => expect(desplazar).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' }))
    expect(screen.getAllByRole('heading', { name: 'Granos y cereales' }).length).toBeGreaterThan(0)
  })
})
