import { createFileRoute } from '@tanstack/react-router'
import { MercaApp } from '@/components/merca/merca-app'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Merca Fácil - Compara tu mercado' },
      {
        name: 'description',
        content: 'Descubre en qué tienda te sale más barato todo tu mercado, si te alcanza el presupuesto y qué recetas puedes cocinar.',
      },
      { property: 'og:title', content: 'Merca Fácil - Compara tu mercado' },
      { property: 'og:description', content: 'Compara precios de D1, Éxito y Jumbo y ahorra en tu mercado.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: MercaApp,
})
