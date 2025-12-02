import {DocumentTextIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Título del Tour',
      description: 'Título principal que aparece en la página. Se auto-completa desde la imagen SEO.',
      initialValue: (context) => {
        const seoImage = context.document?.seoImage?.asset?.originalFilename;
        const mainImage = context.document?.mainImage?.asset?.originalFilename;
        const heroImage = context.document?.heroGallery?.[0]?.asset?.originalFilename;
        
        const filename = seoImage || mainImage || heroImage;
        
        if (filename) {
          return filename
            .replace(/\.[^/.]+$/, '')      // Quita extensión
            .replace(/[-_]/g, ' ')        // - y _ → espacios
            .replace(/\w\S*/g, (txt) =>   // Capitaliza palabras
              txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        }
        return '';
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'URL Slug',
      options: {
        source: 'title',
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'categories', // ← Cambio a plural
      type: 'array',
      title: 'Categorías/Destinos',
      description: 'Selecciona todos los destinos donde aparecerá este tour (ej: Florence, Tuscany, Chianti)',
      of: [
        {
          type: 'reference',
          to: [{type: 'category'}]
        }
      ],
      validation: Rule => Rule.min(1).max(5).required().error('Mínimo 1 categoría, máximo 5')
    }),
    // ========================================
    // SECCIÓN SEO
    // ========================================
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'SEO: Título para buscadores',
      description: 'Título optimizado para Google (50-60 caracteres). Si está vacío, usa el título principal.',
      validation: Rule => Rule.max(60).warning('Máximo 60 caracteres para SEO óptimo')
    }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      title: 'SEO: Descripción Meta',
      description: 'Descripción que aparece en Google (150-160 caracteres)',
      rows: 3,
      validation: Rule => Rule.max(160).warning('Máximo 160 caracteres para SEO óptimo').required()
    }),
    defineField({
      name: 'seoKeywords',
      type: 'array',
      title: 'SEO: Palabras Clave',
      description: 'Palabras clave principales (máximo 5-7)',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      },
      validation: Rule => Rule.max(7).warning('Máximo 7 keywords recomendado')
    }),
    defineField({
      name: 'seoImage',
      type: 'image',
      title: 'SEO: Imagen Social',
      description: 'Imagen para Facebook, WhatsApp, Twitter (1200x630px recomendado)',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Texto alternativo',
        })
      ]
    }),
    
    // ========================================
    // CAMPOS EXISTENTES
    // ========================================
    defineField({
      name: 'mainImage',
      type: 'image',
      title: 'Imagen Principal (legacy)',
      description: 'Usar preferiblemente la imagen SEO arriba',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        })
      ]
    }),
    defineField({
      name: 'heroGallery',
      title: 'Hero Gallery (5 imágenes requeridas)',
      type: 'array',
      of: [{
        type: 'image',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            type: 'string',
            title: 'Alternative text',
          }),
          defineField({
            name: 'title',
            type: 'string',
            title: 'Título de la imagen',
            description: 'Nombre descriptivo para la imagen (ej: "Coliseo desde el exterior")'
          })
        ]
      }],
      validation: Rule => Rule.min(5).max(5).required().error('Exactamente 5 imágenes requeridas para el hero'),
      description: 'Primera imagen = Principal (izquierda), siguientes 4 = Grid derecho'
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Fecha de Publicación',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      title: 'Contenido del Tour'
    }),
    
    // ========================================
    // DATOS ESTRUCTURADOS (SCHEMA.ORG)
    // ========================================
    defineField({
      name: 'tourInfo',
      type: 'object',
      title: 'Información del Tour (Schema.org)',
      description: 'Datos estructurados para aparecer como rich snippet en Google',
      fields: [
        defineField({
          name: 'duration',
          type: 'string',
          title: 'Duración',
          description: 'Ej: "3 horas", "Día completo"'
        }),
        defineField({
          name: 'price',
          type: 'number',
          title: 'Precio (en USD)',
          description: 'Precio base en dólares americanos'
        }),
        defineField({
          name: 'currency',
          type: 'string',
          title: 'Moneda',
          initialValue: 'USD',
          options: {
            list: [
              {title: 'Dólar (USD)', value: 'USD'},
              {title: 'Euro (EUR)', value: 'EUR'},
              {title: 'Peso Argentino (ARS)', value: 'ARS'}
            ]
          }
        }),
        defineField({
          name: 'location',
          type: 'string',
          title: 'Ubicación',
          description: 'Ciudad/lugar principal del tour'
        }),
        // ✅ CAMBIO 1: provider → platform
        defineField({
          name: 'platform',
          type: 'string',
          title: 'Platform',
          description: 'Curator platform (ScootersTour.com)',
          initialValue: 'scooterstour.com'
        })
      ],
      options: {
        collapsible: true,
        collapsed: false
      }
    }),

    // ========================================
    // CARACTERÍSTICAS DEL TOUR
    // ========================================
    defineField({
      name: 'tourFeatures',
      type: 'object',
      title: 'Tour Features & Amenities',
      description: 'Características que aparecerán en structured data y en la página',
      fields: [
        defineField({
          name: 'freeCancellation',
          type: 'boolean',
          title: 'Free Cancellation',
          description: 'Cancelación gratuita disponible',
          initialValue: false
        }),
        defineField({
          name: 'skipTheLine',
          type: 'boolean', 
          title: 'Skip the Line Access',
          description: 'Acceso sin hacer cola',
          initialValue: false
        }),
        defineField({
          name: 'wheelchairAccessible',
          type: 'boolean',
          title: 'Wheelchair Accessible', 
          description: 'Accesible para sillas de ruedas',
          initialValue: false
        }),
        defineField({
          name: 'smallGroupAvailable',
          type: 'boolean',
          title: 'Small Group Available',
          description: 'Grupos pequeños disponibles',
          initialValue: false
        }),
        defineField({
          name: 'hostGuide',
          type: 'string',
          title: 'Host Guide Languages',
          description: 'Idiomas del guía anfitrión (ej: "English, Spanish, French")',
          placeholder: 'English, Spanish, French'
        }),
        defineField({
          name: 'audioGuide',
          type: 'string', 
          title: 'Audio Guide Languages',
          description: 'Idiomas de la audioguía (ej: "English, German, Italian")',
          placeholder: 'English, German, Italian'
        })
      ],
      options: {
        collapsible: true,
        collapsed: false
      }
    }),

    // ========================================
    // GETYOURGUIDE INTEGRATION
    // ========================================
    defineField({
      name: 'getYourGuideTourId',
      type: 'string',
      title: 'GetYourGuide Tour ID',
      description: 'ID del tour en GetYourGuide (ej: 280242). Encuentra el ID en la URL del tour.',
      placeholder: '280242',
      validation: Rule => Rule.regex(/^[0-9]+$/).warning('Solo números permitidos (ej: 280242)')
    }),
    defineField({
      name: 'getYourGuideUrl',
      type: 'url',
      title: 'GetYourGuide URL (Opcional)',
      description: 'URL completa del tour en GetYourGuide para referencia'
    }),

    // 🆕 NUEVO: RATING Y REVIEWS DE GETYOURGUIDE
    defineField({
      name: 'getYourGuideData',
      type: 'object',
      title: '⭐ GetYourGuide Review Data',
      description: '⚠️ Update manually from GetYourGuide product page (check monthly). Copy rating and review count.',
      options: {
        collapsible: true,
        collapsed: false
      },
      fields: [
        defineField({
          name: 'rating',
          type: 'number',
          title: 'Rating ⭐',
          description: 'Current rating from GetYourGuide (e.g., 4.5)',
          validation: Rule => Rule.min(0).max(5).precision(1),
          placeholder: '4.5'
        }),
        defineField({
          name: 'reviewCount',
          type: 'number',
          title: 'Total Reviews',
          description: 'Total number of reviews on GetYourGuide (e.g., 1335)',
          validation: Rule => Rule.min(0).integer(),
          placeholder: '1335'
        }),
        // ✅ CAMBIO 2: NUEVO CAMPO provider
        defineField({
          name: 'provider',
          type: 'string',
          title: 'Tour Provider/Operator 🏢',
          description: 'Physical tour operator from GetYourGuide (e.g., "Vesparella", "Rome by Vespa")',
          placeholder: 'Vesparella'
        }),
        defineField({
          name: 'lastUpdated',
          type: 'datetime',
          title: 'Last Updated',
          description: 'When you last checked GetYourGuide for this data',
          initialValue: () => new Date().toISOString()
        })
      ],
      preview: {
        select: {
          rating: 'rating',
          reviews: 'reviewCount',
          updated: 'lastUpdated'
        },
        prepare({ rating, reviews, updated }) {
          if (!rating) {
            return { 
              title: '⚠️ No rating data - Update from GetYourGuide',
              subtitle: 'Click to add rating and review count'
            };
          }
          const stars = '⭐'.repeat(Math.round(rating));
          return {
            title: `${stars} ${rating}/5 (${reviews?.toLocaleString() || 0} reviews)`,
            subtitle: updated 
              ? `Last updated: ${new Date(updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` 
              : 'Update date not set'
          }
        }
      }
    }),

    defineField({
      name: 'bookingUrl',
      type: 'url',
      title: 'Booking/Affiliate URL',
      description: 'Direct link to GetYourGuide, Viator, or other booking platform with your affiliate ID',
      placeholder: 'https://www.getyourguide.com/activity/t280242/?partner_id=2FVNDZG'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'seoDescription',
      media: 'seoImage',
    },
    prepare(selection) {
      const {title, subtitle} = selection
      return {
        title: title,
        subtitle: subtitle ? `${subtitle.substring(0, 50)}...` : 'Sin descripción SEO'
      }
    },
  },
})