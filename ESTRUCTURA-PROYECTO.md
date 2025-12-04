# 🛴 Estructura del Proyecto - Scooters Tour

## 📁 Árbol de Carpetas Principal

```
scooters-tour/
│
├── 📱 app/                              # Aplicación Next.js App Router
│   ├── [slug]/                          # Páginas dinámicas estáticas
│   │   ├── CategoryPageClient.tsx
│   │   ├── page.tsx
│   │   └── StaticPageClient.tsx
│   │
│   ├── api/                             # API Routes
│   │   ├── fetch-image/
│   │   │   └── route.ts
│   │   ├── fetch-link/
│   │   │   └── route.ts
│   │   ├── tinymce-config/              # (vacío)
│   │   └── viator/
│   │       └── route.ts
│   │
│   ├── blog/                            # Blog
│   │   ├── [slug]/                      # (vacío)
│   │   └── components/                  # (vacío)
│   │
│   ├── components/                      # Componentes UI principales
│   │   ├── blog/
│   │   │   ├── HeroGallery.tsx
│   │   │   ├── HeroGallery.module.css
│   │   │   ├── IconHeading.tsx
│   │   │   ├── RecommendedTours.tsx
│   │   │   ├── RelatedTours.tsx
│   │   │   ├── SanityContent.tsx
│   │   │   ├── sidebar.css
│   │   │   └── TourNavigation.tsx
│   │   │
│   │   ├── Breadcrumbs.tsx
│   │   ├── BubbleComments.tsx
│   │   ├── CategoryEditorialContent.tsx
│   │   ├── CategoryFAQ.tsx
│   │   ├── CitySearch.tsx
│   │   ├── ConditionalHeader.bak
│   │   ├── Container.jsx
│   │   ├── CookieBanner.tsx
│   │   ├── DeferredGA.tsx
│   │   ├── DestinationNavigator.tsx
│   │   ├── FloatingCTA.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.bak
│   │   ├── Header.css
│   │   ├── HeroHostel.tsx
│   │   ├── HeroHostel.css
│   │   ├── HostelMosaic.tsx
│   │   ├── ImpactBanner.tsx
│   │   ├── LugaresPopularesArg.tsx
│   │   ├── MinimalHeader.tsx
│   │   ├── MobileTourPage.tsx
│   │   ├── RatingDisplay.tsx
│   │   ├── SchemaOrgHead.tsx
│   │   ├── ScrollToTop.tsx
│   │   ├── SEOHead.tsx
│   │   ├── TableOfContents.tsx
│   │   ├── TestimonialCarousel.jsx
│   │   ├── TourHeader.tsx
│   │   └── UnifiedAutoLinker.tsx
│   │
│   ├── data/                            # Datos estáticos
│   │   ├── categoryFAQs.ts
│   │   └── cities.json
│   │
│   ├── hooks/                           # Custom React Hooks
│   │   ├── index.ts
│   │   └── usePerformance.ts
│   │
│   ├── layouts/                         # (vacío)
│   │
│   ├── pages/                           # Páginas de categorías
│   │   └── [category]/
│   │       └── page.tsx
│   │
│   ├── studio/                          # Sanity Studio
│   │   └── [[...tool]]/
│   │       └── page.tsx
│   │
│   ├── tour/                            # Páginas de tours individuales
│   │   └── [slug]/
│   │       └── TourPageClient.tsx
│   │
│   ├── utils/                           # Utilidades
│   │   ├── autoLinker.ts
│   │   ├── breadcrumbGenerator.ts
│   │   ├── categoryQueries.ts
│   │   ├── index.ts
│   │   ├── performance.ts
│   │   ├── proTips.ts
│   │   └── schemaGenerator.ts
│   │
│   ├── favicon.bak
│   ├── globals.css                      # Estilos globales
│   ├── icon.png                         # Favicon
│   ├── layout.tsx                       # Layout principal
│   ├── not-found.tsx                    # Página 404
│   ├── page.tsx                         # Página de inicio
│   ├── robots.ts                        # Robots.txt dinámico
│   └── sitemap.ts                       # Sitemap dinámico
│
├── 🎨 public/                           # Archivos estáticos públicos
│   ├── images/
│   │   ├── payment-methods.png
│   │   ├── rider-1.jpg
│   │   ├── rider-2.jpg
│   │   ├── rider-3.jpg
│   │   ├── rider-4.jpg
│   │   ├── vespa-colosseum.jpg
│   │   ├── vespa-verona 1.jpg
│   │   ├── vespa-verona-mobile.jpg
│   │   ├── vespa-verona.jpg
│   │   ├── vespa-verona2.jpg
│   │   └── tours/
│   │       └── colosseum/
│   │           ├── Foro Roman.jpeg
│   │           ├── Foro romano 1.jpeg
│   │           ├── Foro Romano2.jpeg
│   │           ├── hero-2.jpg
│   │           ├── hero-3.jpg
│   │           ├── hero-4.jpg
│   │           ├── hero-5.jpg
│   │           ├── hero-6.jpg
│   │           ├── hero-7.jpg
│   │           ├── hero-main.jpg
│   │           └── Vatican.jpeg
│   │
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── payment-metod.png
│   ├── vercel.svg
│   ├── vespa-verona 1.jpg
│   └── window.svg
│
├── 📝 sanity/                           # Configuración de Sanity CMS
│   ├── lib/
│   │   ├── client.ts                    # Cliente de Sanity
│   │   ├── image.ts                     # Utilidades de imágenes
│   │   └── live.ts                      # Live preview
│   │
│   ├── schemaTypes/                     # Esquemas de contenido
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
│   ├── env.ts                           # Variables de entorno
│   └── structure.ts                     # Estructura del Studio
│
├── 🤖 tour-importer/                    # Herramienta de importación
│   ├── src/
│   │   ├── category-content-generator.js
│   │   ├── contentGenerator.js
│   │   ├── debug-env.js
│   │   ├── generate-category.js
│   │   ├── imageProcessor.js
│   │   ├── index.js
│   │   ├── sanityUploader.js
│   │   └── scraper.js
│   │
│   ├── templates/
│   │   └── post-template.js
│   │
│   ├── temp/                            # (vacío)
│   ├── config.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── 🔧 lib/                              # Librerías compartidas
│   ├── icons.tsx
│   └── supabaseClient.bak
│
├── components/                          # (vacío)
│
├── tours/                               # (vacío)
│
├── 📄 Archivos de configuración raíz
│   ├── next.config.js                   # Configuración de Next.js
│   ├── package.json                     # Dependencias del proyecto
│   ├── package.json.backup
│   ├── package-lock.json
│   ├── tsconfig.json                    # Configuración de TypeScript
│   ├── sanity.config.ts                 # Configuración de Sanity
│   ├── sanity.cli.ts                    # CLI de Sanity
│   └── next-env.d.ts                    # Types de Next.js
│
└── 📚 Documentación
    ├── README.md                        # Documentación principal
    ├── EDITOR_FEATURES.md               # Características del editor
    ├── ESTRUCTURA-PROYECTO.md           # Este archivo
    ├── ESTRUCTURA-PROYECTO.txt
    ├── PROJECT_STRUCTURE.md             # Estructura del proyecto (EN)
    ├── project-structure.txt
    ├── project-structure-detailed.txt
    └── proyecto-arbol.txt
```

## 🎯 Descripción de Módulos Principales

### 1. **App Directory** (`/app`)
- Sistema de rutas de Next.js 13+ con App Router
- Server Components por defecto
- Páginas dinámicas para tours, blog y categorías

### 2. **Componentes** (`/app/components`)
- **Blog**: Componentes específicos para posts del blog
- **UI**: Componentes reutilizables de interfaz
- **SEO**: Componentes para optimización (SEOHead, SchemaOrgHead)

### 3. **API Routes** (`/app/api`)
- Endpoints para proxy de imágenes
- Integración con Viator
- Configuración de TinyMCE

### 4. **Sanity CMS** (`/sanity`)
- Esquemas de contenido
- Cliente y configuración
- Sistema de tipos para el CMS

### 5. **Tour Importer** (`/tour-importer`)
- Herramienta para importar tours desde fuentes externas
- Procesamiento de imágenes
- Subida automática a Sanity

## 🔥 Tecnologías Principales

- **Framework**: Next.js 14+ (App Router)
- **CMS**: Sanity.io
- **Estilos**: CSS Modules + Global CSS
- **TypeScript**: Para type safety
- **Componentes**: React Server Components + Client Components

## 📦 Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| `app/layout.tsx` | Layout principal de la app |
| `app/page.tsx` | Página de inicio |
| `next.config.js` | Configuración de Next.js |
| `sanity.config.ts` | Configuración del CMS |
| `app/globals.css` | Estilos globales |

---

**Última actualización**: Diciembre 2025
