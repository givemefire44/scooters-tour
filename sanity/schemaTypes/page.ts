// schemaTypes/page.ts
import { type SchemaTypeDefinition } from 'sanity'
import {defineField, defineType} from 'sanity'

export const pageType: SchemaTypeDefinition = defineType({
  name: 'page',
  title: 'Static Pages',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'The main title of your page (e.g. "About Us", "Privacy Policy")'
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'This will be the URL: colosseumroman.com/[slug]'
    }),
    
    // Agregar este campo después del slug en page.ts (línea aproximada 25)
    defineField({
      name: 'category',
      title: 'Page Category',
      type: 'reference',
      to: [{ type: 'pageCategory' }],
      description: 'Optional: Assign this page to a category for better organization',
      options: {
        disableNew: false,
      }
    }),


    // ========================================
    // TIPO DE PÁGINA
    // ========================================
    defineField({
      name: 'pageType',
      title: 'Page Type',
      type: 'string',
      description: 'Choose the layout and features for this page',
      options: {
        list: [
          { title: 'Simple Page (About, Privacy, etc.)', value: 'simple' },
          { title: 'Hero Page (SEO Landing, Tips, etc.)', value: 'hero' }
        ],
        layout: 'radio'
      },
      initialValue: 'simple',
      validation: (Rule) => Rule.required()
    }),

    // ========================================
    // HERO SECTION
    // ========================================
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      description: 'Main image for the page hero section (1200x600px recommended)',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Describe the image for accessibility and SEO',
          validation: (Rule) => Rule.required()
        },
        {
          name: 'heading',
          type: 'string',
          title: 'Image Heading/Caption',
          description: 'Optional heading text to overlay on the image'
        }
      ],
      hidden: ({ document }) => document?.pageType !== 'hero'
    }),

    defineField({
      name: 'heroContent',
      type: 'object',
      title: 'Hero Content',
      description: 'Content for the hero section',
      fields: [
        {
          name: 'heroTitle',
          type: 'string',
          title: 'Hero Title Override',
          description: 'Custom title for the hero section (uses page title if empty)'
        },
        {
          name: 'heroSubtitle',
          type: 'text',
          title: 'Hero Subtitle',
          description: 'Subtitle that appears under the hero title',
          rows: 2
        },
        {
          name: 'excerpt',
          type: 'text',
          title: 'Page Excerpt',
          description: 'Brief description that appears in the hero (2-3 lines)',
          rows: 3
        },
        {
          name: 'customText',
          type: 'text',
          title: 'Custom Hero Text',
          description: 'Optional custom text for hero overlay (uses excerpt if empty)',
          rows: 2,
          placeholder: 'Discover the secrets of ancient Rome...'
        }
      ],
      options: {
        collapsible: true,
        collapsed: false
      },
      hidden: ({ document }) => document?.pageType !== 'hero'
    }),

    // ========================================
    // HIGHLIGHTS/TIPS
    // ========================================
    defineField({
      name: 'highlights',
      type: 'array',
      title: 'Page Highlights/Tips',
      description: 'Key points, tips, or selling points (max 8)',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Highlight Title',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'description',
              type: 'text',
              title: 'Description',
              rows: 2
            },
            {
              name: 'icon',
              type: 'string',
              title: 'Icon (emoji)',
              description: 'Single emoji that represents this tip',
              initialValue: '💡'
            }
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
              media: 'icon'
            },
            prepare(selection) {
              const { title, subtitle, icon } = selection;
              return {
                title: `${icon || '💡'} ${title || 'Untitled'}`,
                subtitle: subtitle ? subtitle.substring(0, 60) + '...' : 'No description'
              };
            }
          }
        }
      ],
      validation: Rule => Rule.max(8).warning('Maximum 8 highlights recommended'),
      hidden: ({ document }) => document?.pageType !== 'hero'
    }),

    // ========================================
    // CONFIGURACIONES ADICIONALES
    // ========================================
    defineField({
      name: 'pageSettings',
      type: 'object',
      title: 'Page Settings',
      description: 'Additional settings for pages',
      fields: [
        {
          name: 'showRecommendedTours',
          type: 'boolean',
          title: 'Show Recommended Tours',
          description: 'Display recommended tours component at the bottom',
          initialValue: false
        },
        {
          name: 'backgroundColor',
          type: 'string',
          title: 'Background Color',
          description: 'Optional background color for the page',
          options: {
            list: [
              { title: 'Default (White)', value: 'white' },
              { title: 'Light Gray', value: 'gray-50' },
              { title: 'Light Blue', value: 'blue-50' },
              { title: 'Light Purple', value: 'purple-50' }
            ]
          },
          initialValue: 'white'
        },
        {
          name: 'ctaText',
          type: 'string',
          title: 'CTA Button Text',
          description: 'Custom text for the sidebar CTA button (e.g. "Book Now", "Get Started")',
          placeholder: 'Browse Tours'
        },
        {
          name: 'ctaUrl',
          type: 'url',
          title: 'CTA Button URL',
          description: 'Where the CTA button should link to',
          placeholder: 'https://getyourguide.com/rome'
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),

    // ========================================
    // SIDEBAR WIDGET CONTROL
    // ========================================
    defineField({
      name: 'sidebarWidget',
      type: 'object',
      title: 'Sidebar Widget',
      description: 'Control the sidebar widget appearance and content',
      fields: [
        {
          name: 'showWidget',
          title: 'Show Sidebar Widget',
          type: 'boolean',
          description: 'Display the sidebar widget on this page',
          initialValue: true
        },
        {
          name: 'ctaTitle',
          title: 'CTA Title',
          type: 'string',
          description: 'Main title for the widget CTA section',
          placeholder: 'Ready to Explore Rome?',
          validation: Rule => Rule.max(50)
        },
        {
          name: 'ctaDescription',
          title: 'CTA Description', 
          type: 'text',
          description: 'Description text below the CTA title',
          rows: 3,
          placeholder: 'Discover the best tours and experiences in Rome...',
          validation: Rule => Rule.max(200)
        },
        {
          name: 'ctaButtonText',
          title: 'CTA Button Text',
          type: 'string',
          description: 'Text that appears on the CTA button',
          placeholder: 'Browse Tours',
          validation: Rule => Rule.max(20)
        },
        {
          name: 'ctaButtonUrl',
          title: 'CTA Button URL',
          type: 'url',
          description: 'Where the CTA button links to',
          placeholder: 'https://getyourguide.com/rome'
        },
        {
          name: 'widgetImage',
          title: 'Widget Image',
          type: 'image',
          description: 'Custom image for this page widget (300x200px recommended)',
          options: {
            hotspot: true
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Describe the image for accessibility'
            }
          ]
        },
        {
          name: 'quickLinks',
          title: 'Quick Links',
          type: 'array',
          description: 'Custom navigation links in the sidebar',
          of: [
            {
              type: 'object',
              title: 'Link',
              fields: [
                {
                  name: 'title',
                  title: 'Link Title',
                  type: 'string',
                  validation: Rule => Rule.required()
                },
                {
                  name: 'url',
                  title: 'Link URL',
                  type: 'string',
                  description: 'Can be relative (/tours) or absolute (https://...)',
                  validation: Rule => Rule.required()
                },
                {
                  name: 'icon',
                  title: 'Icon (Emoji)',
                  type: 'string',
                  description: 'Single emoji to display next to the link',
                  validation: Rule => Rule.max(4),
                  placeholder: '🔗'
                }
              ],
              preview: {
                select: {
                  title: 'title',
                  subtitle: 'url',
                  icon: 'icon'
                },
                prepare({ title, subtitle, icon }) {
                  return {
                    title: `${icon || '🔗'} ${title || 'Untitled Link'}`,
                    subtitle: subtitle || 'No URL'
                  }
                }
              }
            }
          ],
          initialValue: [
            { title: 'Homepage', url: '/', icon: '🏛️' },
            { title: 'All Tours', url: '/tours', icon: '🎫' },
            { title: 'About Us', url: '/about', icon: 'ℹ️' },
            { title: 'Contact', url: '/contact', icon: '📧' }
          ]
        }
      ],
      options: {
        collapsible: true,
        collapsed: false
      }
    }),

    // ========================================
    // CAMPOS SEO
    // ========================================
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'SEO: Title Tag',
      description: 'Optimized title for search engines (50-60 characters). If empty, uses page title.',
      validation: Rule => Rule.max(60).warning('Maximum 60 characters for optimal SEO')
    }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      title: 'SEO: Meta Description',
      description: 'Description that appears in Google search results (150-160 characters)',
      rows: 3,
      validation: Rule => Rule.max(160).warning('Maximum 160 characters for optimal SEO')
    }),
    defineField({
      name: 'seoKeywords',
      type: 'array',
      title: 'SEO: Keywords',
      description: 'Main keywords for this page (maximum 5-7)',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      },
      validation: Rule => Rule.max(7).warning('Maximum 7 keywords recommended')
    }),
    defineField({
      name: 'seoImage',
      type: 'image',
      title: 'SEO: Social Media Image',
      description: 'Image for Facebook, WhatsApp, Twitter sharing (1200x630px recommended)',
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

    // ========================================
    // CONTENIDO PRINCIPAL - ARREGLADO
    // ========================================
    defineField({
      name: 'content',
      title: 'Page Content',
      type: 'array',
      description: 'The main content of your page with rich text and images',
      of: [
        // 1️⃣ BLOQUES DE TEXTO
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'H5', value: 'h5' },
            { title: 'H6', value: 'h6' },
            { title: 'Quote', value: 'blockquote' }
          ],
          lists: [
            { title: 'Bullet List', value: 'bullet' },
            { title: 'Numbered List', value: 'number' }
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' }
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                    validation: Rule => Rule.uri({
                      scheme: ['http', 'https', 'mailto', 'tel']
                    })
                  },
                  {
                    title: 'Open in new tab',
                    name: 'blank',
                    type: 'boolean',
                    initialValue: true
                  }
                ]
              }
            ]
          }
        },
        
        // 2️⃣ IMAGEN SIMPLE
        {
          type: 'image',
          title: 'Image',
          options: { 
            hotspot: true,
            storeOriginalFilename: true
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
              description: 'Important for SEO and accessibility',
              validation: Rule => Rule.required()
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption that appears below the image'
            }
          ]
        },

        // 3️⃣ GALERÍA DE IMÁGENES - CORREGIDA
        {
          type: 'object',
          name: 'imageGallery',
          title: 'Image Gallery',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Gallery Title',
              description: 'Optional title for the gallery'
            },
            {
              name: 'images',
              type: 'array',
              title: 'Images',
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                  fields: [
                    {
                      name: 'alt',
                      type: 'string',
                      title: 'Alternative text',
                      validation: Rule => Rule.required()
                    },
                    {
                      name: 'caption',
                      type: 'string',
                      title: 'Caption'
                    }
                  ]
                }
              ],
              validation: Rule => Rule.min(2).max(12)
            },
            {
              name: 'layout',
              type: 'string',
              title: 'Gallery Layout',
              options: {
                list: [
                  { title: 'Grid (2 columns)', value: 'grid-2' },
                  { title: 'Grid (3 columns)', value: 'grid-3' },
                  { title: 'Carousel/Slider', value: 'carousel' }
                ]
              },
              initialValue: 'grid-2'
            }
          ],
          preview: {
            select: {
              title: 'title',
              media: 'images.0'
            },
            prepare(selection) {
              const { title, media } = selection
              return {
                title: title || 'Image Gallery',
                subtitle: `Gallery with ${selection.images?.length || 0} images`,
                media: media
              }
            }
          }
        },

        // 4️⃣ IMAGEN CON TEXTO (Lado a lado)
        {
          type: 'object',
          name: 'imageWithText',
          title: 'Image with Text',
          fields: [
            {
              name: 'image',
              type: 'image',
              title: 'Image',
              options: { hotspot: true },
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative text',
                  validation: Rule => Rule.required()
                }
              ],
              validation: Rule => Rule.required()
            },
            {
              name: 'text',
              type: 'array',
              title: 'Text Content',
              of: [{ type: 'block' }]
            },
            {
              name: 'layout',
              type: 'string',
              title: 'Layout',
              options: {
                list: [
                  { title: 'Image Left, Text Right', value: 'image-left' },
                  { title: 'Text Left, Image Right', value: 'text-left' }
                ]
              },
              initialValue: 'image-left'
            }
          ],
          preview: {
            select: {
              title: 'text',
              media: 'image'
            },
            prepare(selection) {
              return {
                title: 'Image with Text',
                subtitle: selection.layout || 'Mixed content block',
                media: selection.media
              }
            }
          }
        },

        // 5️⃣ CALL TO ACTION BOX
        {
          type: 'object',
          name: 'ctaBox',
          title: 'Call to Action Box',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'CTA Title',
              validation: Rule => Rule.required()
            },
            {
              name: 'description',
              type: 'text',
              title: 'Description',
              rows: 3
            },
            {
              name: 'buttonText',
              type: 'string',
              title: 'Button Text',
              validation: Rule => Rule.required()
            },
            {
              name: 'buttonUrl',
              type: 'url',
              title: 'Button URL',
              validation: Rule => Rule.required()
            },
            {
              name: 'style',
              type: 'string',
              title: 'Style',
              options: {
                list: [
                  { title: 'Primary (Pink)', value: 'primary' },
                  { title: 'Secondary (Purple)', value: 'secondary' },
                  { title: 'Outline', value: 'outline' }
                ]
              },
              initialValue: 'primary'
            }
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'buttonText'
            }
          }
        },

        // 6️⃣ TABLA SIMPLE
        {
          type: 'object',
          name: 'simpleTable',
          title: 'Simple Table',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Table Title'
            },
            {
              name: 'rows',
              type: 'array',
              title: 'Table Rows',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'cells',
                      type: 'array',
                      title: 'Cells',
                      of: [{ type: 'string' }]
                    }
                  ]
                }
              ]
            }
          ],
          preview: {
            select: {
              title: 'title'
            },
            prepare(selection) {
              return {
                title: selection.title || 'Table',
                subtitle: 'Data table'
              }
            }
          }
        }
      ]
    }),

    // ========================================
    // RICH SNIPPETS & SCHEMA.ORG
    // ========================================
    // Agregar esto en page.ts después de seoImage y antes de content
// Línea aproximada 380, después del campo seoImage

    defineField({
      name: 'richSnippets',
      type: 'object',
      title: 'Rich Snippets & SEO',
      description: 'Configuración avanzada para rich snippets en Google',
      options: {
        collapsible: true,
        collapsed: false
      },
      fields: [
        defineField({
          name: 'schemaType',
          type: 'string',
          title: 'Tipo de Schema',
          description: 'Qué tipo de contenido es esta página',
          options: {
            list: [
              {title: 'Artículo/Guía', value: 'Article'},
              {title: 'Guía Paso a Paso', value: 'HowTo'}, 
              {title: 'Lista/Tips', value: 'ItemList'},
              {title: 'Reseña', value: 'Review'},
              {title: 'FAQ', value: 'FAQPage'},
              {title: 'Página Web Simple', value: 'WebPage'}
            ]
          },
          initialValue: 'Article'
        }),
        defineField({
          name: 'readingTime',
          type: 'number',
          title: 'Tiempo de Lectura (minutos)',
          description: 'Cuántos minutos toma leer el contenido',
          validation: Rule => Rule.min(1).max(120)
        }),
        defineField({
          name: 'wordCount',
          type: 'number',
          title: 'Cantidad de Palabras',
          description: 'Número aproximado de palabras del contenido'
        }),
        defineField({
          name: 'difficulty',
          type: 'string',
          title: 'Nivel de Dificultad',
          options: {
            list: [
              {title: 'Fácil', value: 'Beginner'},
              {title: 'Intermedio', value: 'Intermediate'},
              {title: 'Avanzado', value: 'Advanced'}
            ]
          }
        }),
        defineField({
          name: 'estimatedCost',
          type: 'object',
          title: 'Costo Estimado',
          description: 'Para guías que involucran gastos (tours, tickets, etc.)',
          fields: [
            defineField({
              name: 'currency',
              type: 'string',
              title: 'Moneda',
              initialValue: 'EUR',
              options: {
                list: ['EUR', 'USD', 'GBP']
              }
            }),
            defineField({
              name: 'minValue',
              type: 'number',
              title: 'Precio Mínimo'
            }),
            defineField({
              name: 'maxValue',
              type: 'number', 
              title: 'Precio Máximo'
            })
          ]
        }),
        defineField({
          name: 'timeRequired',
          type: 'string',
          title: 'Tiempo Requerido (para visitas)',
          description: 'Ej: 3 horas, 1 día. Para páginas sobre tours/visitas',
          placeholder: '3 hours'
        }),
        defineField({
          name: 'about',
          type: 'object',
          title: 'Acerca De',
          description: 'De qué trata principalmente el contenido',
          fields: [
            defineField({
              name: 'name',
              type: 'string',
              title: 'Nombre del Lugar/Atracción',
              placeholder: 'Colosseum, Vatican Museums, etc.'
            }),
            defineField({
              name: 'type',
              type: 'string',
              title: 'Tipo de Lugar',
              options: {
                list: [
                  {title: 'Atracción Turística', value: 'TouristAttraction'},
                  {title: 'Monumento', value: 'Monument'},
                  {title: 'Museo', value: 'Museum'},
                  {title: 'Ciudad', value: 'City'},
                  {title: 'Lugar', value: 'Place'}
                ]
              },
              initialValue: 'TouristAttraction'
            }),
            defineField({
              name: 'city',
              type: 'string',
              title: 'Ciudad',
              description: 'Ciudad donde se encuentra (ej: Rome, Panglao)',
              placeholder: 'Rome'
            }),
            defineField({
              name: 'country',
              type: 'string',
              title: 'País',
              description: 'País donde se encuentra (ej: Italy, Philippines)',
              placeholder: 'Italy'
            })
          ]
        }),
        defineField({
          name: 'steps',
          type: 'array',
          title: 'Pasos (solo para HowTo)',
          description: 'Solo llenar si es una guía paso a paso',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'name',
                  type: 'string',
                  title: 'Nombre del Paso'
                }),
                defineField({
                  name: 'text',
                  type: 'text',
                  title: 'Descripción del Paso',
                  rows: 3
                }),
                defineField({
                  name: 'url',
                  type: 'url',
                  title: 'URL (opcional)',
                  description: 'Link a más información sobre este paso'
                })
              ],
              preview: {
                select: {
                  title: 'name',
                  subtitle: 'text'
                }
              }
            }
          ],
          hidden: ({ parent }) => parent?.schemaType !== 'HowTo'
        }),
        defineField({
          name: 'faqItems',
          type: 'array',
          title: 'FAQ Items (solo para FAQ)',
          description: 'Solo llenar si es una página de preguntas frecuentes',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'question',
                  type: 'string',
                  title: 'Pregunta'
                }),
                defineField({
                  name: 'answer',
                  type: 'text',
                  title: 'Respuesta',
                  rows: 3
                })
              ],
              preview: {
                select: {
                  title: 'question',
                  subtitle: 'answer'
                }
              }
            }
          ],
          hidden: ({ parent }) => parent?.schemaType !== 'FAQPage'
        }),
        defineField({
          name: 'itemList',
          type: 'array',
          title: 'Lista de Items (solo para listas)',
          description: 'Para páginas como "Top 10 Tips"',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'name',
                  type: 'string',
                  title: 'Nombre del Item'
                }),
                defineField({
                  name: 'description',
                  type: 'text',
                  title: 'Descripción',
                  rows: 2
                }),
                defineField({
                  name: 'url',
                  type: 'url',
                  title: 'URL (opcional)'
                })
              ],
              preview: {
                select: {
                  title: 'name',
                  subtitle: 'description'
                }
              }
            }
          ],
          hidden: ({ parent }) => parent?.schemaType !== 'ItemList'
        }),
        defineField({
          name: 'rating',
          type: 'object',
          title: 'Rating (para reseñas)',
          fields: [
            defineField({
              name: 'ratingValue',
              type: 'number',
              title: 'Puntuación',
              description: 'Del 1 al 5',
              validation: Rule => Rule.min(1).max(5)
            }),
            defineField({
              name: 'bestRating',
              type: 'number',
              title: 'Mejor Puntuación Posible',
              initialValue: 5
            }),
            defineField({
              name: 'worstRating',
              type: 'number',
              title: 'Peor Puntuación Posible', 
              initialValue: 1
            })
          ],
          hidden: ({ parent }) => parent?.schemaType !== 'Review'
        })
      ]
    }),

    // ========================================
    // NAVIGATION SETTINGS
    // ========================================
    defineField({
      name: 'showInMenu',
      title: 'Show in Navigation Menu',
      type: 'boolean',
      description: 'Check this to display this page in the header navigation',
      initialValue: false
    }),
    defineField({
      name: 'menuOrder',
      title: 'Menu Order',
      type: 'number',
      description: 'Order of appearance in menu (lower numbers appear first)',
      hidden: ({ document }) => !document?.showInMenu
    }),

    // ========================================
    // FOOTER SETTINGS
    // ========================================
    defineField({
      name: 'showInFooter',
      title: 'Show in Footer',
      type: 'boolean',
      description: 'Check this to display this page in the footer navigation',
      initialValue: false
    }),
    defineField({
      name: 'footerOrder',
      title: 'Footer Order',
      type: 'number',
      description: 'Order of appearance in footer (lower numbers appear first)',
      hidden: ({ document }) => !document?.showInFooter
    }),

    // ========================================
    // LEGACY SEO (compatibilidad)
    // ========================================
    defineField({
      name: 'seo',
      title: 'SEO Settings (LEGACY)',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title (DEPRECATED)',
          type: 'string',
          description: 'DEPRECATED: Use seoTitle instead',
          hidden: true
        },
        {
          name: 'metaDescription',
          title: 'Meta Description (DEPRECATED)',
          type: 'text',
          description: 'DEPRECATED: Use seoDescription instead',
          hidden: true
        }
      ],
      description: 'Legacy SEO fields - Use the new SEO fields above',
      options: {
        collapsible: true,
        collapsed: true
      }
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    })
  ],
  
  preview: {
    select: {
      title: 'title',
      subtitle: 'seoDescription',
      slug: 'slug.current',
      pageType: 'pageType',
      media: 'heroImage'
    },
    prepare(selection: {title?: string, subtitle?: string, slug?: string, pageType?: string, media?: any}) {
      const { title, subtitle, slug, pageType } = selection;
      const typeLabel = pageType === 'hero' ? '🎯 Hero' : '📄 Simple';
      return {
        title: `${typeLabel} ${title || 'Untitled Page'}`,
        subtitle: subtitle ? `${subtitle.substring(0, 50)}...` : (slug ? `/${slug}` : '/no-slug')
      };
    }
  }
})