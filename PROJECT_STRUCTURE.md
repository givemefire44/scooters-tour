# Estructura del Proyecto Scooters Tour

## 📁 Estructura Principal

```
scooters-tour/
│
├── 📂 app/                          # Carpeta principal de Next.js App Router
│   ├── 📂 [slug]/                   # Páginas dinámicas estáticas
│   │   ├── page.tsx
│   │   └── StaticPageClient.tsx
│   │
│   ├── 📂 api/                      # API Routes
│   │   ├── fetch-image/
│   │   ├── fetch-link/
│   │   ├── tinymce-config/
│   │   └── viator/
│   │
│   ├── 📂 blog/                     # Sección del blog
│   │   ├── [slug]/
│   │   └── components/
│   │
│   ├── 📂 components/               # Componentes de la aplicación
│   │   ├── 📂 blog/                # Componentes específicos del blog
│   │   │   ├── HeroGallery.tsx
│   │   │   ├── IconHeading.tsx
│   │   │   ├── RecommendedTours.tsx
│   │   │   ├── RelatedTours.tsx
│   │   │   ├── SanityContent.tsx
│   │   │   ├── sidebar.css
│   │   │   └── TourNavigation.tsx
│   │   │
│   │   ├── Breadcrumbs.tsx
│   │   ├── BubbleComments.tsx
│   │   ├── CategoryFAQ.tsx
│   │   ├── CitySearch.tsx
│   │   ├── Container.jsx
│   │   ├── CookieBanner.tsx
│   │   ├── DeferredGA.tsx
│   │   ├── FloatingCTA.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.css
│   │   ├── HeroHostel.css
│   │   ├── HeroHostel.tsx
│   │   ├── HostelMosaic.tsx
│   │   ├── ImpactBanner.tsx
│   │   ├── LugaresPopularesArg.tsx
│   │   ├── MinimalHeader.tsx
│   │   ├── MobileTourPage.tsx
│   │   ├── RatingDisplay.tsx
│   │   ├── SchemaOrgHead.tsx
│   │   ├── ScrollToTop.tsx
│   │   ├── SEOHead.tsx
│   │   ├── TestimonialCarousel.jsx
│   │   ├── TourHeader.tsx
│   │   ├── UnifiedAutoLinker.tsx
│   │   └── VespaSection.tsx
│   │
│   ├── 📂 data/                     # Datos estáticos
│   │   ├── categoryFAQs.ts
│   │   └── cities.json
│   │
│   ├── 📂 hooks/                    # Custom React Hooks
│   │   ├── index.ts
│   │   └── usePerformance.ts
│   │
│   ├── 📂 pages/                    # Páginas por categoría
│   │   └── [category]/
│   │       └── page.tsx
│   │
│   ├── 📂 tour/                     # Páginas de tours individuales
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── TourPageClient.tsx
│   │
│   ├── 📂 tours/                    # Listado de tours por categoría
│   │   └── [category]/
│   │       └── page.tsx
│   │
│   ├── 📂 utils/                    # Utilidades
│   │   ├── autoLinker.ts
│   │   ├── index.ts
│   │   ├── performance.ts
│   │   ├── proTips.ts
│   │   └── schemaGenerator.ts
│   │
│   ├── 📂 studio/                   # Sanity Studio
│   │   └── [[...tool]]/
│   │       └── page.tsx
│   │
│   ├── globals.css                  # Estilos globales
│   ├── layout.tsx                   # Layout principal
│   ├── page.tsx                     # Página principal (Home)
│   ├── not-found.tsx               # Página 404
│   ├── robots.ts                    # Configuración robots.txt
│   └── sitemap.ts                   # Generación del sitemap
│
├── 📂 sanity/                       # Configuración de Sanity CMS
│   ├── 📂 lib/
│   │   ├── client.ts
│   │   ├── image.ts
│   │   └── live.ts
│   │
│   ├── 📂 schemaTypes/             # Schemas de Sanity
│   │   ├── authorType.ts
│   │   ├── blockContentType.ts
│   │   ├── categoryType.ts
│   │   ├── destinationCard.ts
│   │   ├── homepage.ts
│   │   ├── index.ts
│   │   ├── mosaicCard.ts
│   │   ├── page.ts
│   │   ├── pageCategoryType.ts
│   │   └── postType.ts
│   │
│   ├── env.ts
│   └── structure.ts
│
├── 📂 public/                       # Archivos públicos estáticos
│   ├── 📂 images/
│   │   ├── payment-methods.png
│   │   ├── rider-1.jpg
│   │   ├── rider-2.jpg
│   │   ├── rider-3.jpg
│   │   ├── rider-4.jpg
│   │   ├── vespa-colosseum.jpg
│   │   └── 📂 tours/
│   │       └── colosseum/          # Imágenes del tour del Coliseo
│   │
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── 📂 lib/                          # Librerías compartidas
│   ├── icons.tsx
│   └── supabaseClient.bak
│
├── 📂 dist/                         # Build de producción (generado)
│
├── 📂 node_modules/                 # Dependencias (generado)
│
├── 📄 package.json                  # Dependencias del proyecto
├── 📄 package-lock.json             # Lock de dependencias
├── 📄 next.config.js                # Configuración de Next.js
├── 📄 tsconfig.json                 # Configuración de TypeScript
├── 📄 sanity.config.ts             # Configuración de Sanity
├── 📄 sanity.cli.ts                # CLI de Sanity
├── 📄 next-env.d.ts                # Tipos de Next.js
├── 📄 README.md                     # Documentación
└── 📄 EDITOR_FEATURES.md           # Características del editor
```

## 🗂️ Descripción de Carpetas Principales

### `/app` - Aplicación Next.js 14+
Utiliza el nuevo App Router de Next.js con la estructura de carpetas basada en archivos.

- **`/components`**: Componentes React reutilizables
- **`/api`**: Endpoints de API
- **`/tour/[slug]`**: Páginas dinámicas para tours individuales
- **`/tours/[category]`**: Listados de tours por categoría
- **`/blog`**: Sección del blog
- **`/utils`**: Funciones de utilidad

### `/sanity` - CMS Headless
Configuración y schemas para Sanity CMS, usado para gestionar contenido.

### `/public` - Archivos Estáticos
Imágenes, iconos y otros recursos públicos servidos directamente.

## 📦 Dependencias Principales

El proyecto utiliza:
- **Next.js 14+** - Framework React
- **Sanity CMS** - Sistema de gestión de contenido
- **TypeScript** - Tipado estático
- **React** - Librería UI

## 🎨 Archivos de Configuración

- `next.config.js` - Configuración de Next.js
- `tsconfig.json` - Configuración de TypeScript
- `sanity.config.ts` - Configuración del CMS
- `package.json` - Gestión de dependencias






