// Base de recetas suministrada para Merca Fácil. Los ingredientes se relacionan
// con el catálogo mediante id_producto; los nombres no se usan para buscarlos.
import baseRecetas from './recetas_completas_medellin.json'

export type IngredienteRecetaArchivo = {
  id_producto: string
  nombre: string
  presentacion: string
}

export type RecetaArchivo = {
  id_receta: string
  nombre: string
  tiempo_comida: string
  categoria_base: string[]
  ingredientes_principales: IngredienteRecetaArchivo[]
  ingrediente_gancho?: IngredienteRecetaArchivo & { razon: string }
  preparacion: string[]
}

export const RECETAS_ARCHIVO: RecetaArchivo[] = baseRecetas.recetas
