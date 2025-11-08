import {defineType, defineArrayMember} from 'sanity'
import {ImageIcon, ImagesIcon} from '@sanity/icons'

export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1 - Título Principal', value: 'h1'},
        {title: 'H2 - Título Grande', value: 'h2'},
        {title: 'H3 - Título Mediano', value: 'h3'},
        {title: 'H4 - Título Pequeño', value: 'h4'},
        
        // ICONOS H2 ORIGINALES
        {title: '📋 H2 - Detalles', value: 'h2-details'},
        {title: '🌟 H2 - Destacados', value: 'h2-highlights'},
        
        // ICONOS H2 CLEAN (SIN ROJO, SIN FONDO)
        {title: '📋 H2 - Detalles Clean', value: 'h2-details-clean'},
        {title: '🌟 H2 - Destacados Clean', value: 'h2-highlights-clean'},
        
        // ICONOS H3 ORIGINALES
        {title: '❌ H3 - Cancelaciones', value: 'h3-cancel'},
        {title: '⏰ H3 - Horarios', value: 'h3-time'},
        {title: '📍 H3 - Ubicación', value: 'h3-location'},
        {title: '🎫 H3 - Incluye', value: 'h3-includes'},
        {title: '👥 H3 - Grupo', value: 'h3-group'},
        {title: '💳 H3 - Precios', value: 'h3-price'},
        {title: '🚌 H3 - Transporte', value: 'h3-transport'},
        {title: '📝 H3 - Requisitos', value: 'h3-requirements'},
        {title: '✅ H3 - Cancelación Gratis', value: 'h3-check'},
        {title: '🔄 H3 - Skip Line', value: 'h3-skip'},
        {title: '👤 H3 - Host/Guía', value: 'h3-host'},
        {title: '🎧 H3 - Audio Incluido', value: 'h3-audio'},
        {title: '♿ H3 - Accesible', value: 'h3-wheelchair'},
        
        // ICONOS H3 CLEAN (SIN ROJO, SIN FONDO)
        {title: '❌ H3 - Cancelaciones Clean', value: 'h3-cancel-clean'},
        {title: '⏰ H3 - Horarios Clean', value: 'h3-time-clean'},
        {title: '📍 H3 - Ubicación Clean', value: 'h3-location-clean'},
        {title: '🎫 H3 - Incluye Clean', value: 'h3-includes-clean'},
        {title: '👥 H3 - Grupo Clean', value: 'h3-group-clean'},
        {title: '💳 H3 - Precios Clean', value: 'h3-price-clean'},
        {title: '🚌 H3 - Transporte Clean', value: 'h3-transport-clean'},
        {title: '📝 H3 - Requisitos Clean', value: 'h3-requirements-clean'},
        {title: '✅ H3 - Cancelación Gratis Clean', value: 'h3-check-clean'},
        {title: '🔄 H3 - Skip Line Clean', value: 'h3-skip-clean'},
        {title: '👤 H3 - Host/Guía Clean', value: 'h3-host-clean'},
        {title: '🎧 H3 - Audio Incluido Clean', value: 'h3-audio-clean'},
        {title: '♿ H3 - Accesible Clean', value: 'h3-wheelchair-clean'},
        
        // ICONOS H4 ORIGINALES
        {title: '⚡ H4 - Importante', value: 'h4-important'},
        {title: '📞 H4 - Contacto', value: 'h4-contact'},
        {title: '🎯 H4 - Objetivo', value: 'h4-target'},
        {title: '💡 H4 - Consejo', value: 'h4-tip'},
        {title: '⚠️ H4 - Advertencia', value: 'h4-warning'},
        
        // ICONOS H4 CLEAN (SIN ROJO, SIN FONDO)
        {title: '⚡ H4 - Importante Clean', value: 'h4-important-clean'},
        {title: '📞 H4 - Contacto Clean', value: 'h4-contact-clean'},
        {title: '🎯 H4 - Objetivo Clean', value: 'h4-target-clean'},
        {title: '💡 H4 - Consejo Clean', value: 'h4-tip-clean'},
        {title: '⚠️ H4 - Advertencia Clean', value: 'h4-warning-clean'},
        
        {title: 'Quote', value: 'blockquote'},
      ],
      // ✅ AGREGADO: Listas numeradas y bullets
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'} // ← NUEVO
      ],
      marks: {
        // ✅ DECORATORS COMPLETOS (negritas, cursivas, código, etc.)
        decorators: [
          {title: 'Strong', value: 'strong'},           // Negrita (Ctrl+B)
          {title: 'Emphasis', value: 'em'},             // Cursiva (Ctrl+I)
          {title: 'Code', value: 'code'},               // Código inline
          {title: 'Underline', value: 'underline'},     // Subrayado
          {title: 'Strike', value: 'strike-through'},   // Tachado
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
            ],
          },
        ],
      },
    }),
    // Imagen individual
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        }
      ]
    }),
    // Gallery/Mosaico de imágenes
    defineArrayMember({
      type: 'object',
      name: 'gallery',
      title: 'Image Gallery',
      icon: ImagesIcon,
      fields: [
        {
          name: 'images',
          type: 'array',
          title: 'Images',
          of: [
            {
              type: 'image',
              options: {hotspot: true},
              fields: [
                {
                  name: 'alt',
                  type: 'string',
                  title: 'Alternative text',
                },
                {
                  name: 'caption',
                  type: 'string',
                  title: 'Caption',
                }
              ]
            }
          ],
          options: {
            layout: 'grid',
          },
          validation: (Rule) => Rule.max(4).min(2).error('Gallery should have between 2-4 images')
        },
        {
          name: 'layout',
          type: 'string',
          title: 'Layout',
          options: {
            list: [
              {title: '2 columns', value: 'two-columns'},
              {title: '3 columns', value: 'three-columns'},
              {title: 'Mixed', value: 'mixed'}
            ],
            layout: 'radio'
          },
          initialValue: 'three-columns'
        }
      ],
      preview: {
        select: {
          images: 'images',
          layout: 'layout'
        },
        prepare(selection) {
          const {images, layout} = selection
          const imageCount = images?.length || 0
          return {
            title: `Gallery (${imageCount} images)`,
            subtitle: layout,
            media: images?.[0]
          }
        }
      }
    }),
  ],
})