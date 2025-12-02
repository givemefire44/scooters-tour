// app/utils/breadcrumbGenerator.ts

interface BreadcrumbItem {
    label: string
    href?: string
    isActive?: boolean
  }
  
  interface BreadcrumbData {
    title: string
    slug: string
    categoryTitle?: string
    categorySlug?: string
    isHeroPage?: boolean
  }
  
  /**
   * Genera breadcrumbs simples y directos para ScootersTour
   * - Categorías: Home → Rome Tours
   * - Tours: Home → Rome Tours → Tour Name
   * - Páginas: Home → Page Title (solo si isHeroPage = true)
   */
  export function generateBreadcrumbs(
    contentType: 'category' | 'tour' | 'page',
    data: BreadcrumbData
  ): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ]
  
    switch (contentType) {
      case 'category':
        // Home → Rome Vespa Tours (extrae solo hasta los ":" si existen)
        const categoryTitle = data.title.includes(':') 
          ? data.title.split(':')[0].trim()
          : data.title;
        
        breadcrumbs.push({
          label: categoryTitle,
          isActive: true
        })
        break
  
      case 'tour':
        // Home → Rome Vespa Tours → Tour Name
        if (data.categoryTitle && data.categorySlug) {
          // Extraer solo hasta los ":" si existen
          const categoryTitle = data.categoryTitle.includes(':')
            ? data.categoryTitle.split(':')[0].trim()
            : data.categoryTitle;
          
          breadcrumbs.push({
            label: categoryTitle,
            href: `/${data.categorySlug}`
          })
        }
        breadcrumbs.push({
          label: data.title,
          isActive: true
        })
        break
  
      case 'page':
        // Home → Page Title (solo para hero pages, para SEO)
        if (data.isHeroPage) {
          breadcrumbs.push({
            label: data.title,
            isActive: true
          })
        }
        break
    }
  
    return breadcrumbs
  }