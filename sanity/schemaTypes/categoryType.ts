import {TagIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Category Name',
      description: 'e.g. Roma, Paris, Madrid',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'region',
      title: 'Geographic Region',
      type: 'string',
      description: 'Regional grouping for related tours (e.g., Tuscany, Lazio, Lombardy)',
      options: {
        list: [
          { title: 'Tuscany', value: 'tuscany' },
          { title: 'Lazio (Rome area)', value: 'lazio' },
          { title: 'Lombardy (Milan area)', value: 'lombardy' },
          { title: 'Veneto (Venice area)', value: 'veneto' },
          { title: 'Campania (Naples area)', value: 'campania' },
          { title: 'Sicily', value: 'sicily' },
          { title: 'Emilia-Romagna (Bologna area)', value: 'emilia-romagna' },
          { title: 'Piedmont (Turin area)', value: 'piedmont' },
          { title: 'Liguria (Genoa area)', value: 'liguria' },
          { title: 'Puglia (Bari, Lecce)', value: 'puglia' },
          { title: 'Sardinia', value: 'sardinia' },
          { title: 'Umbria (Perugia, Assisi)', value: 'umbria' },
          { title: 'Abruzzo', value: 'abruzzo' },
          { title: 'Calabria', value: 'calabria' },
          // Fuera de Italia
          { title: 'Île-de-France (Paris)', value: 'ile-de-france' },
          { title: 'Florida (USA)', value: 'florida' },
          { title: 'Buenos Aires Province', value: 'buenos-aires' },
        ]
      },
      validation: Rule => Rule.required()
    }),

    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Featured Destination',
      description: '⭐ Show in "Popular Destinations" sidebar (max 5-6 recommended)',
      initialValue: false,
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      description: 'Brief description that appears under the title',
      rows: 3,
    }),
    
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      description: 'Country for geographic diversification',
      options: {
        list: [
          { title: '🇮🇹 Italy', value: 'italy' },
          { title: '🇫🇷 France', value: 'france' },
          { title: '🇺🇸 United States', value: 'usa' },
          { title: '🇪🇸 Spain', value: 'spain' },
          { title: '🇩🇪 Germany', value: 'germany' },
          { title: '🇵🇹 Portugal', value: 'portugal' },
          { title: '🇬🇧 United Kingdom', value: 'uk' },
          { title: '🇦🇷 Argentina', value: 'argentina' },
          { title: '🇧🇷 Brazil', value: 'brazil' },
          { title: '🇲🇽 Mexico', value: 'mexico' },
        ]
      },
      validation: Rule => Rule.required()
    }),


    // ========================================
    // IMAGEN PRINCIPAL (HERO)
    // ========================================
    defineField({
      name: 'image',
      title: 'Hero Image',
      type: 'image',
      description: 'Main image for the category page hero section (1200x600px recommended)',
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
    }),
    
    // ========================================
    // SECCIÓN SEO COMPLETA
    // ========================================
    defineField({
      name: 'seoTitle',
      type: 'string',
      title: 'SEO: Title Tag',
      description: 'Optimized title for search engines (50-60 characters). If empty, uses category name.',
      validation: Rule => Rule.max(60).warning('Maximum 60 characters for optimal SEO')
    }),
    defineField({
      name: 'seoDescription',
      type: 'text',
      title: 'SEO: Meta Description',
      description: 'Description that appears in Google search results (150-160 characters)',
      rows: 3,
      validation: Rule => Rule.max(160).warning('Maximum 160 characters for optimal SEO').required()
    }),
    defineField({
      name: 'seoKeywords',
      type: 'array',
      title: 'SEO: Keywords',
      description: 'Main keywords for this destination (maximum 5-7)',
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
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        }
      ]
    }),
    
    // ========================================
    // CONTENIDO ADICIONAL
    // ========================================
    defineField({
      name: 'editorialTitle',
      type: 'string',
      title: 'Editorial Section Title',
      description: 'Auto-generated title: "Why You Should Take a Vespa Tour in..."',
    }),
    defineField({
      name: 'longDescription',
      type: 'blockContent',
      title: 'Long Description',
      description: 'Detailed description for the category page content (for SEO and users)',
      }),
    defineField({
      name: 'featuredText',
      type: 'string',
      title: 'Featured Text',
      description: 'Short compelling text to highlight this destination',
    }),
    
    // ========================================
    // 🆕 FAQs FLEXIBLES
    // ========================================
    defineField({
      name: 'faqs',
      type: 'array',
      title: 'FAQs',
      description: 'Frequently Asked Questions for this city (5-15 recommended for SEO)',
      of: [
        {
          type: 'object',
          title: 'FAQ Item',
          fields: [
            {
              name: 'question',
              type: 'string',
              title: 'Question',
              description: 'The question users might ask',
              validation: Rule => Rule.required().max(200)
            },
            {
              name: 'answer',
              type: 'text',
              title: 'Answer',
              description: 'Detailed answer (2-4 sentences works best for SEO)',
              rows: 4,
              validation: Rule => Rule.required().min(50).max(500)
            }
          ],
          preview: {
            select: {
              title: 'question',
              subtitle: 'answer'
            },
            prepare({ title, subtitle }) {
              return {
                title: title || 'Empty question',
                subtitle: subtitle ? `${subtitle.substring(0, 60)}...` : 'No answer'
              }
            }
          }
        }
      ],

    }),
    
    // ========================================
    // CONTENIDO ADICIONAL PARA LA PÁGINA
    // ========================================
    defineField({
      name: 'pageContent',
      type: 'object',
      title: 'Page Content & Features',
      description: 'Content that appears on the category page',
      fields: [
        {
          name: 'heroTitle',
          type: 'string',
          title: 'Hero Title Override',
          description: 'Custom title for the hero section (uses category title if empty)'
        },
        {
          name: 'heroSubtitle',
          type: 'text',
          title: 'Hero Subtitle',
          description: 'Subtitle that appears under the hero title',
          rows: 2
        },
        {
          name: 'highlights',
          type: 'array',
          title: 'Category Highlights',
          description: 'Key features or selling points (max 4)',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'title',
                  type: 'string',
                  title: 'Highlight Title'
                },
                {
                  name: 'description',
                  type: 'string',
                  title: 'Brief Description'
                },
                {
                  name: 'icon',
                  type: 'string',
                  title: 'Icon (emoji)',
                  initialValue: '✨'
                }
              ]
            }
          ],
          validation: Rule => Rule.max(4).warning('Maximum 4 highlights recommended')
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),
    
    // ========================================
    // CAMPOS LEGACY (mantener compatibilidad)
    // ========================================
    defineField({
      name: 'metaTitle',
      title: 'Meta Title (LEGACY)',
      type: 'string',
      description: 'DEPRECATED: Use seoTitle instead',
      hidden: true,
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description (LEGACY)',
      type: 'text',
      description: 'DEPRECATED: Use seoDescription instead',
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'seoDescription',
      media: 'image',
    },
    prepare(selection) {
      const {title, subtitle} = selection
      return {
        title: title,
        subtitle: subtitle ? `${subtitle.substring(0, 50)}...` : 'No SEO description'
      }
    },
  },
})