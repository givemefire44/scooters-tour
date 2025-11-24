import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import StaticPageClient from './StaticPageClient'

// Interface expandida para páginas estáticas
interface SanityPage {
  title: string;
  slug: {
    current: string;
  };
  content: any;
  pageType?: string; // ← NUEVO: 'simple' | 'hero'
  
  // Hero fields
  heroImage?: {
    asset: { url: string };
    alt?: string;
    heading?: string;
  };
  heroContent?: {
    heroTitle?: string;
    heroSubtitle?: string;
    excerpt?: string;
    customText?: string; // ← NUEVO CAMPO
  };
  highlights?: Array<{
    title: string;
    description?: string;
    icon?: string;
  }>;
  pageSettings?: {
    showRecommendedTours?: boolean;
    backgroundColor?: string;
    ctaText?: string;    // ← NUEVO CAMPO
    ctaUrl?: string;     // ← NUEVO CAMPO
  };
  
  // SEO fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoImage?: {
    asset: { url: string };
    alt?: string;
  };
  publishedAt?: string;
  _updatedAt?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };

  // Rich Snippets
  richSnippets?: {
    schemaType?: 'Article' | 'HowTo' | 'ItemList' | 'Review' | 'FAQPage' | 'WebPage';
    readingTime?: number;
    wordCount?: number;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedCost?: {
      currency: string;
      minValue?: number;
      maxValue?: number;
    };
    timeRequired?: string;
    about?: {
      name: string;
      type: 'TouristAttraction' | 'Monument' | 'Museum' | 'City' | 'Place';
    };
    steps?: Array<{
      name: string;
      text: string;
      url?: string;
    }>;
    faqItems?: Array<{
      question: string;
      answer: string;
    }>;
    itemList?: Array<{
      name: string;
      description?: string;
      url?: string;
    }>;
    rating?: {
      ratingValue: number;
      bestRating: number;
      worstRating: number;
    };
  };
}

// ✅ QUERY CORREGIDA - CON TODOS LOS TIPOS DE CONTENIDO E IMÁGENES
async function getPage(slug: string): Promise<SanityPage | null> {
  const query = `
    *[_type == "page" && slug.current == $slug][0] {
      title,
      slug,
      
      // 🆕 CONTENIDO EXPANDIDO CON TODAS LAS IMÁGENES
      content[]{
        ...,
        // Imagen simple
        _type == "image" => {
          _type,
          asset->{
            _id,
            url
          },
          alt,
          caption
        },
        // Galería de imágenes
        _type == "imageGallery" => {
          _type,
          title,
          layout,
          images[]{
            asset->{
              _id,
              url
            },
            alt,
            caption
          }
        },
        // Imagen con texto
        _type == "imageWithText" => {
          _type,
          layout,
          image{
            asset->{
              _id,
              url
            },
            alt
          },
          text
        },
        // CTA Box
        _type == "ctaBox" => {
          _type,
          title,
          description,
          buttonText,
          buttonUrl,
          style
        },
        // Tabla simple
        _type == "simpleTable" => {
          _type,
          title,
          rows[]{
            cells[]
          }
        },
        // Bloques de texto con links
        _type == "block" => {
          ...,
          markDefs[]{
            ...,
            _type == "link" => {
              _type,
              href,
              blank
            }
          }
        }
      },
      
      pageType,
      
      // Hero fields (pueden no existir en páginas viejas)
      heroImage{
        asset->{
          _id,
          url
        },
        alt,
        heading
      },
      heroContent{
        heroTitle,
        heroSubtitle,
        excerpt,
        customText
      },
      highlights[]{
        title,
        description,
        icon
      },
      pageSettings{
        showRecommendedTours,
        backgroundColor,
        ctaText,
        ctaUrl
      },
      
      // Sidebar Widget
      sidebarWidget{
        showWidget,
        ctaTitle,
        ctaDescription,
        ctaButtonText,
        ctaButtonUrl,
        widgetImage{
          asset->{
            _id,
            url
          },
          alt
        },
        quickLinks[]{
          title,
          url,
          icon
        }
      },
      
      // SEO fields
      seoTitle,
      seoDescription,
      seoKeywords,
      seoImage{
        asset->{
          _id,
          url
        },
        alt
      },
      publishedAt,
      _updatedAt,
      
      // LEGACY compatibility
      seo {
        metaTitle,
        metaDescription
      },

      // 🆕 RICH SNIPPETS
      richSnippets{
        schemaType,
        readingTime,
        wordCount,
        difficulty,
        estimatedCost{
          currency,
          minValue,
          maxValue
        },
        timeRequired,
        about{
          name,
          type
        },
        steps[]{
          name,
          text,
          url
        },
        faqItems[]{
          question,
          answer
        },
        itemList[]{
          name,
          description,
          url
        },
        rating{
          ratingValue,
          bestRating,
          worstRating
        }
      }
    }
  `
  // ✅ CONFIGURACIÓN DE CACHE EXPLÍCITA
  return await client.fetch(query, { slug }, {
    next: { revalidate: 3600 } // Cache por 1 hora
  })
}

// ✅ FUNCIÓN CORREGIDA - CON CONFIGURACIÓN DE CACHE EXPLÍCITA
async function getRecommendedTours() {
  const query = `
    *[_type == "post"] | order(_createdAt desc)[0...60]{
      _id,
      title,
      slug,
      mainImage{
        asset->{
          url
        },
        alt
      },
      heroGallery[]{
        asset->{
          url
        },
        alt
      },
      body
    }
  `
  // ✅ CONFIGURACIÓN DE CACHE EXPLÍCITA
  return await client.fetch(query, {}, {
    next: { revalidate: 1800 } // Cache por 30 minutos
  })
}

// ✅ GENERATEMETADATA con params async - Next.js 15
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  
  const page = await getPage(slug)
  if (!page) {
    return {
      title: 'Page Not Found | ',
      description: 'This page doesn\'t exist.'
    }
  }

  const baseUrl = 'https://.com'
  const canonical = `${baseUrl}/${slug}`
  
  // SEO data con fallbacks
  const title = page.seoTitle || page.seo?.metaTitle || `${page.title} | ScootersTour`
  const description = page.seoDescription || page.seo?.metaDescription || 
    page.heroContent?.excerpt || `Learn more about ${page.title} at ScootersTour`
  const keywords = page.seoKeywords || [page.title.toLowerCase(), 'ScootersTour', 'rome tours']

  // 🚀 IMAGEN SOCIAL OPTIMIZADA
  const socialImage = page.seoImage 
    ? urlFor(page.seoImage).width(1200).height(630).format('webp').quality(85).url()
    : page.heroImage 
    ? urlFor(page.heroImage).width(1200).height(630).format('webp').quality(85).url()
    : `${baseUrl}/images/default-page.jpg`

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'ScootersTour' }],
    creator: 'ScootersTour',
    publisher: 'ScootersTour',
    
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonical,
      title,
      description,
      siteName: 'ScootersTour',
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: page.seoImage?.alt || page.heroImage?.alt || title,
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
    
    alternates: {
      canonical,
      languages: {
        'en': canonical,
      },
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    }
  }
}

// ✅ Componente principal Server Component
export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const page = await getPage(slug)
  if (!page) {
    notFound()
  }

  // Obtener tours recomendados si están habilitados
  const recommendedTours = page.pageSettings?.showRecommendedTours 
    ? await getRecommendedTours() 
    : []

  // Pasar datos al Client Component
  return <StaticPageClient page={page} slug={slug} recommendedTours={recommendedTours} />
}