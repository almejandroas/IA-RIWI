import { useState } from 'react'
import { BuscadorProductos } from './buscador-productos'
import { Categorias } from './categorias'

type Props = {
  idsEnLista: Set<string>
  onAgregar: (productoId: string) => void
}

// Pestaña 1: buscador y categorías. La lista vive en la columna derecha (o en el panel en celular).
export function PestanaMercado({ idsEnLista, onAgregar }: Props) {
  const [categoria, setCategoria] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="titulo-agregar" className="flex flex-col gap-2">
        <h2 id="titulo-agregar" className="text-xl font-extrabold">
          Agrega productos
        </h2>
        <BuscadorProductos idsEnLista={idsEnLista} onAgregar={onAgregar} />
      </section>

      <Categorias seleccionada={categoria} onSeleccionar={setCategoria} idsEnLista={idsEnLista} onAgregar={onAgregar} />
    </div>
  )
}
