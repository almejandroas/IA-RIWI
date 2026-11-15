import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, X } from 'lucide-react'
import { calcularRanking, combinarListas, sugerirRecetas, type ItemLista } from '@/lib/calculos'
import {
  agregarGuardado,
  escribirGuardados,
  firmaItems,
  leerGuardados,
  nombrePorDefecto,
  type MercadoGuardado,
} from '@/lib/mis-mercados'
import { Encabezado } from './encabezado'
import { NavegacionPestanas, type Pestana } from './navegacion-pestanas'
import { EstadoPresupuesto } from './estado-presupuesto'
import { PestanaMercado } from './pestana-mercado'
import { PestanaResultado } from './pestana-resultado'
import { PestanaRecetas } from './pestana-recetas'
import { PestanaSugerencias } from './pestana-sugerencias'
import { PestanaMisMercados } from './pestana-mis-mercados'
import { PanelLista } from './panel-lista'
import { Modal, claseBotonPrincipal, claseBotonSecundario, claseBotonTexto } from './modal'

type Carga = { items: ItemLista[]; origen?: MercadoGuardado }
type Cargado = { id: string; nombre: string; firma: string }

// Componente principal: guarda la lista y el presupuesto, y recalcula todo al instante.
export function MercaApp() {
  const [pestana, setPestana] = useState<Pestana>('mercado')
  const [items, setItems] = useState<ItemLista[]>([])
  const [presupuesto, setPresupuesto] = useState<number | null>(null)
  const [listaAbierta, setListaAbierta] = useState(false)
  const [guardados, setGuardados] = useState<MercadoGuardado[]>([])
  const [cargaPendiente, setCargaPendiente] = useState<Carga | null>(null)
  const [cargado, setCargado] = useState<Cargado | null>(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => setGuardados(leerGuardados()), [])

  const idsEnLista = useMemo(() => new Set(items.map((item) => item.productoId)), [items])
  const ranking = useMemo(() => calcularRanking(items), [items])
  const tiendaMasBarata = ranking[0]!
  const recetas = useMemo(
    () => sugerirRecetas(idsEnLista, presupuesto, tiendaMasBarata.total),
    [idsEnLista, presupuesto, tiendaMasBarata.total],
  )
  const hayProductos = items.length > 0

  function cambiarPestana(p: Pestana) {
    setPestana(p)
    setListaAbierta(false)
  }

  function agregarProducto(productoId: string) {
    setItems((actuales) =>
      actuales.some((item) => item.productoId === productoId) ? actuales : [...actuales, { productoId, cantidad: 1 }],
    )
  }

  function cambiarCantidad(productoId: string, cambio: number) {
    setItems((actuales) =>
      actuales.map((item) =>
        item.productoId === productoId ? { ...item, cantidad: Math.max(1, item.cantidad + cambio) } : item,
      ),
    )
  }

  function quitarProducto(productoId: string) {
    setItems((actuales) => actuales.filter((item) => item.productoId !== productoId))
  }

  function agregarFaltantes(productoIds: string[]) {
    setItems((actuales) => {
      const existentes = new Set(actuales.map((item) => item.productoId))
      const nuevos = productoIds
        .filter((productoId) => !existentes.has(productoId))
        .map((productoId) => ({ productoId, cantidad: 1 }))
      return nuevos.length > 0 ? [...actuales, ...nuevos] : actuales
    })
  }

  // ---------- Cargar una lista (sugerencia o guardado) ----------

  function pedirCarga(carga: Carga) {
    if (items.length === 0) aplicarCarga(carga, 'reemplazar')
    else setCargaPendiente(carga)
  }

  function aplicarCarga({ items: nuevos, origen }: Carga, modo: 'reemplazar' | 'agregar') {
    setItems(modo === 'reemplazar' ? nuevos.map((i) => ({ ...i })) : combinarListas(items, nuevos))
    setCargado(origen ? { id: origen.id, nombre: origen.nombre, firma: firmaItems(origen.items) } : null)
    setCargaPendiente(null)
    cambiarPestana('mercado')
  }

  // ---------- Guardar ----------

  function guardarNuevo(nombre: string) {
    const nuevo: MercadoGuardado = {
      id: crypto.randomUUID(),
      nombre: nombre.trim() || nombrePorDefecto(),
      fecha: new Date().toISOString(),
      items: items.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
    }
    const lista = agregarGuardado(guardados, nuevo)
    setGuardados(lista)
    escribirGuardados(lista)
    setCargado({ id: nuevo.id, nombre: nuevo.nombre, firma: firmaItems(nuevo.items) })
    setGuardando(false)
  }

  function actualizarCargado() {
    if (!cargado) return
    const copia = items.map(({ productoId, cantidad }) => ({ productoId, cantidad }))
    const lista = guardados.map((m) => (m.id === cargado.id ? { ...m, items: copia, fecha: new Date().toISOString() } : m))
    setGuardados(lista)
    escribirGuardados(lista)
    setCargado({ ...cargado, firma: firmaItems(copia) })
    setGuardando(false)
  }

  function eliminarGuardado(id: string) {
    const lista = guardados.filter((m) => m.id !== id)
    setGuardados(lista)
    escribirGuardados(lista)
    if (cargado?.id === id) setCargado(null)
  }

  const cargadoExiste = cargado && guardados.some((m) => m.id === cargado.id)
  const cargadoModificado = Boolean(cargadoExiste && cargado && firmaItems(items) !== cargado.firma)

  const panel = (
    <PanelLista
      items={items}
      ranking={ranking}
      presupuesto={presupuesto}
      onPresupuesto={setPresupuesto}
      onCambiarCantidad={cambiarCantidad}
      onQuitar={quitarProducto}
      onVerResultado={() => cambiarPestana('resultado')}
      onGuardar={() => setGuardando(true)}
    />
  )

  return (
    <div className="min-h-dvh pb-28 md:pb-10">
      <Encabezado />
      <NavegacionPestanas
        pestanaActiva={pestana}
        onCambiar={cambiarPestana}
        cantidadProductos={items.length}
        cantidadRecetas={recetas.length}
      />

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 pt-5 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <main className="min-w-0">
          {pestana === 'resultado' && (
            <EstadoPresupuesto
              hayProductos={hayProductos}
              presupuesto={presupuesto}
              totalMasBarato={tiendaMasBarata.total}
              nombreTienda={tiendaMasBarata.tienda.nombre}
            />
          )}

          {pestana === 'mercado' && <PestanaMercado idsEnLista={idsEnLista} onAgregar={agregarProducto} />}

          {pestana === 'resultado' && (
            <PestanaResultado
              ranking={ranking}
              hayProductos={hayProductos}
              cantidadProductos={items.reduce((suma, item) => suma + item.cantidad, 0)}
              onIrAMercado={() => cambiarPestana('mercado')}
            />
          )}

          {pestana === 'recetas' && (
            <PestanaRecetas
              recetas={recetas}
              hayProductos={hayProductos}
              presupuesto={presupuesto}
              totalActual={tiendaMasBarata.total}
              tiendaActual={tiendaMasBarata.tienda}
              onPresupuesto={setPresupuesto}
              onAgregarFaltantes={agregarFaltantes}
              onIrAMercado={() => cambiarPestana('mercado')}
            />
          )}

          {pestana === 'sugerencias' && (
            <PestanaSugerencias presupuesto={presupuesto} onPresupuesto={setPresupuesto} onUsar={(i) => pedirCarga({ items: i })} />
          )}

          {pestana === 'mis-mercados' && (
            <PestanaMisMercados
              guardados={guardados}
              onCargar={(m) => pedirCarga({ items: m.items, origen: m })}
              onEliminar={eliminarGuardado}
            />
          )}
        </main>

        {/* Computador: la lista siempre visible a la derecha */}
        <aside aria-label="Mi lista" className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pb-6 pr-1">{panel}</div>
        </aside>
      </div>

      {/* Celular: botón flotante del carrito */}
      <button
        type="button"
        onClick={() => setListaAbierta(true)}
        aria-label={`Abrir mi lista (${items.length} productos)`}
        className="fixed bottom-24 right-4 z-40 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float lg:hidden"
      >
        <ShoppingCart className="size-7" aria-hidden="true" />
        <span className="absolute -right-1 -top-1 flex min-w-6 items-center justify-center rounded-full bg-cta px-1.5 py-0.5 text-sm font-extrabold text-cta-foreground">
          {items.length}
        </span>
      </button>

      {listaAbierta && (
        <div className="fixed inset-0 z-50 bg-overlay lg:hidden" onClick={() => setListaAbierta(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mi lista"
            onClick={(e) => e.stopPropagation()}
            className="animate-in slide-in-from-bottom absolute inset-x-0 bottom-0 top-[5dvh] flex flex-col rounded-t-3xl bg-background duration-300"
          >
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                onClick={() => setListaAbierta(false)}
                className="flex items-center gap-1 rounded-full bg-muted px-4 py-2 font-bold"
              >
                <X className="size-5" aria-hidden="true" />
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-8">{panel}</div>
          </div>
        </div>
      )}

      {cargaPendiente && (
        <Modal titulo="Ya tienes productos en tu lista" onCerrar={() => setCargaPendiente(null)}>
          <p className="text-muted-foreground">¿Qué quieres hacer con tu lista actual?</p>
          <button type="button" className={claseBotonPrincipal} onClick={() => aplicarCarga(cargaPendiente, 'reemplazar')}>
            Reemplazar mi lista
          </button>
          <button type="button" className={claseBotonSecundario} onClick={() => aplicarCarga(cargaPendiente, 'agregar')}>
            Agregar a mi lista
          </button>
          <button type="button" className={claseBotonTexto} onClick={() => setCargaPendiente(null)}>
            Cancelar
          </button>
        </Modal>
      )}

      {guardando && (
        <DialogoGuardar
          nombreCargado={cargadoModificado ? cargado!.nombre : null}
          onActualizar={actualizarCargado}
          onGuardarNuevo={guardarNuevo}
          onCerrar={() => setGuardando(false)}
        />
      )}
    </div>
  )
}

function DialogoGuardar({
  nombreCargado,
  onActualizar,
  onGuardarNuevo,
  onCerrar,
}: {
  nombreCargado: string | null
  onActualizar: () => void
  onGuardarNuevo: (nombre: string) => void
  onCerrar: () => void
}) {
  const [comoNuevo, setComoNuevo] = useState(nombreCargado === null)
  const [nombre, setNombre] = useState('')

  return (
    <Modal titulo="Guardar mercado" onCerrar={onCerrar}>
      {!comoNuevo && nombreCargado ? (
        <>
          <button type="button" className={claseBotonPrincipal} onClick={onActualizar}>
            Actualizar «{nombreCargado}»
          </button>
          <button type="button" className={claseBotonSecundario} onClick={() => setComoNuevo(true)}>
            Guardar como nuevo
          </button>
        </>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            onGuardarNuevo(nombre)
          }}
        >
          <label htmlFor="nombre-mercado" className="font-bold">
            Nombre (opcional)
          </label>
          <input
            id="nombre-mercado"
            autoFocus
            value={nombre}
            maxLength={60}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={nombrePorDefecto()}
            className="h-14 rounded-xl border-2 border-input bg-background px-4 text-lg font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
          />
          <p className="text-sm text-muted-foreground">Se guarda en este navegador. Máximo 5 mercados.</p>
          <button type="submit" className={claseBotonPrincipal}>
            Guardar
          </button>
        </form>
      )}
    </Modal>
  )
}
