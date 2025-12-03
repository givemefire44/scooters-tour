// app/sitemap.ts - VERSION CON DEBUG MEJORADO

import { MetadataRoute } from 'next'
import { client } from '@/sanity/lib/client'

type SitemapEntry = {
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://scooterstour.com'
  
  console.log('🔍 SITEMAP EJECUTÁNDOSE - GENERANDO URLs...')
  
  try {
    // 🔄 CONSULTA MÁS DETALLADA PARA DEBUG
    const data = await client.fetch(`
      {
        "posts": *[_type == "post"]{
          "slug": slug.current,
          "_updatedAt": _updatedAt,
          "_createdAt": _createdAt,
          "title": title,
          "_id": _id,
          "hasSlug": defined(slug.current)
        },
        "pages": *[_type == "page"]{
          "slug": slug.current,
          "_updatedAt": _updatedAt,
          "_createdAt": _createdAt,
          "title": title,
          "_id": _id,
          "hasSlug": defined(slug.current)
        },
        "categories": *[_type == "category"]{
          "slug": slug.current,
          "_updatedAt": _updatedAt,
          "_createdAt": _createdAt,
          "title": title,
          "_id": _id,
          "hasSlug": defined(slug.current)
        }
      }
    `)

    // 🔍 DEBUG COMPLETO
    console.log('📊 DATOS RECIBIDOS DE SANITY:')
    console.log(`🏛️ Posts totales encontrados: ${data.posts?.length || 0}`)
    console.log(`📁 Categories totales encontradas: ${data.categories?.length || 0}`)
    console.log(`📄 Pages totales encontradas: ${data.pages?.length || 0}`)

    // Mostrar cuáles NO tienen slug
    const postsWithoutSlug = data.posts?.filter((p: any) => !p.hasSlug) || []
    const pagesWithoutSlug = data.pages?.filter((p: any) => !p.hasSlug) || []
    const categoriesWithoutSlug = data.categories?.filter((c: any) => !c.hasSlug) || []

    if (postsWithoutSlug.length > 0) {
      console.log('⚠️ Posts SIN SLUG:', postsWithoutSlug.map((p: any) => `${p.title} (${p._id})`))
    }
    if (pagesWithoutSlug.length > 0) {
      console.log('⚠️ Pages SIN SLUG:', pagesWithoutSlug.map((p: any) => `${p.title} (${p._id})`))
    }
    if (categoriesWithoutSlug.length > 0) {
      console.log('⚠️ Categories SIN SLUG:', categoriesWithoutSlug.map((c: any) => `${c.title} (${c._id})`))
    }

    const sitemap: SitemapEntry[] = []

    // 🏠 PÁGINA HOME
    sitemap.push({
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    })

    // 🏛️ TOURS/POSTS - SOLO CON SLUG VÁLIDO
    if (data.posts) {
      const validPosts = data.posts.filter((post: any) => post.slug && post.slug.trim() !== '')
      console.log(`✅ Posts válidos con slug: ${validPosts.length}`)
      
      validPosts.forEach((post: any) => {
        const url = `${baseUrl}/tour/${post.slug}`
        console.log(`📝 Agregando tour: ${url}`)
        sitemap.push({
          url,
          lastModified: new Date(post._updatedAt || post._createdAt),
          changeFrequency: 'weekly',
          priority: 0.9
        })
      })
    }

    // 📁 CATEGORÍAS - SOLO CON SLUG VÁLIDO
    if (data.categories) {
      const validCategories = data.categories.filter((cat: any) => cat.slug && cat.slug.trim() !== '')
      console.log(`✅ Categories válidas con slug: ${validCategories.length}`)
      
      validCategories.forEach((category: any) => {
        const url = `${baseUrl}/tours/${category.slug}`
        console.log(`📁 Agregando categoría: ${url}`)
        sitemap.push({
          url,
          lastModified: new Date(category._updatedAt || category._createdAt),
          changeFrequency: 'weekly',
          priority: 0.8
        })
      })
    }

    // 📄 PÁGINAS ESTÁTICAS - SOLO CON SLUG VÁLIDO
    if (data.pages) {
      const validPages = data.pages.filter((page: any) => page.slug && page.slug.trim() !== '')
      console.log(`✅ Pages válidas con slug: ${validPages.length}`)
      
      validPages.forEach((page: any) => {
        let priority = 0.7
        let changeFreq: SitemapEntry['changeFrequency'] = 'monthly'
        
        if (page.slug === 'tips') {
          priority = 0.8
          changeFreq = 'weekly'
        } else if (page.slug === 'about' || page.slug === 'contact') {
          priority = 0.5
          changeFreq = 'yearly'
        }

        const url = `${baseUrl}/${page.slug}`
        console.log(`📄 Agregando página: ${url}`)
        sitemap.push({
          url,
          lastModified: new Date(page._updatedAt || page._createdAt),
          changeFrequency: changeFreq,
          priority: priority
        })
      })
    }

    // 📊 RESUMEN FINAL
    console.log(`🎯 SITEMAP GENERADO:`)
    console.log(`📊 Total URLs: ${sitemap.length}`)
    console.log(`🏠 Home: 1`)
    console.log(`🏛️ Tours: ${data.posts?.filter((p: any) => p.slug).length || 0}`)
    console.log(`📁 Categories: ${data.categories?.filter((c: any) => c.slug).length || 0}`)
    console.log(`📄 Pages: ${data.pages?.filter((p: any) => p.slug).length || 0}`)

    // Listar todas las URLs generadas
    console.log('🔗 URLs GENERADAS:')
    sitemap.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.url}`)
    })

    return sitemap

  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
    
    return [{
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0
    }]
  }
}

export const revalidate = 0 // Desactivar cache temporalmente para debug