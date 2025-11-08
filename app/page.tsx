import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { Metadata } from 'next'
import { Suspense } from 'react'
import Container from "./components/Container";
import HeroHostel from "./components/HeroHostel";
import TestimonialCarousel from "./components/TestimonialCarousel";
import HostelGrid from "./components/HostelMosaic";
import Footer from "./components/Footer";
import ImpactBanner from "./components/ImpactBanner";
import LugaresPopularesArg from "./components/LugaresPopularesArg";
import RecommendedTours from "./components/blog/RecommendedTours";

// ========================================
// 🚀 CONFIGURACIÓN EXTREMA DE PERFORMANCE
// ========================================
export const revalidate = 180; // 3 minutos - balance perfecto entre fresh/speed
export const dynamic = 'force-static'
export const dynamicParams = true
export const fetchCache = 'default-cache'

// ========================================
// 📊 QUERIES ULTRA-OPTIMIZADAS
// ========================================
const getHomepage = async () => {
  return await client.fetch(`
    *[_type == "homepage"][0]{
      seo{
        title,
        description,
        keywords,
        socialImage{
          asset->{
            _id,
            url,
            metadata {
              dimensions {
                width,
                height
              }
            }
          },
          alt
        }
      },
      structuredData{
        organizationName,
        organizationType,
        description,
        contactInfo
      }
    }
  `, {}, {
    next: { revalidate: 300 }
  })
}

const getRecommendedTours = async () => {
  return await client.fetch(`
    *[_type == "post"] | order(_createdAt desc)[0...60]{
      _id,
      title,
      slug,
      mainImage{
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height
            }
          }
        },
        alt
      },
      heroGallery[0...3]{
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height
            }
          }
        },
        alt
      },
      body[0...2]
    }
  `, {}, {
    next: { revalidate: 180 }
  })
}

const getMosaicData = async () => {
  return await client.fetch(`
    *[_type == "mosaicCard" && active == true] | order(order asc)[0...9]{
      name,
      location,
      image{
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height
            }
          }
        },
        alt
      },
      url,
      order
    }
  `, {}, {
    next: { revalidate: 300 }
  })
}

const getDestinations = async () => {
  return await client.fetch(`
    *[_type == "destinationCard" && active == true] | order(order asc)[0...8]{
      nombre,
      image{
        asset->{
          _id,
          url,
          metadata {
            dimensions {
              width,
              height
            }
          }
        },
        alt
      },
      url,
      order
    }
  `, {}, {
    next: { revalidate: 300 }
  })
}

// ========================================
// 🔍 METADATA ULTRA-SEO OPTIMIZADO
// ========================================
export async function generateMetadata(): Promise<Metadata> {
  const homepage = await getHomepage()
  
  const title = homepage?.seo?.title || 'Rome Tours & Experiences | ColosseumRoman'
  const description = homepage?.seo?.description || 'Discover authentic Rome with skip-the-line tours, expert guides, and unforgettable experiences. Book your perfect Roman adventure today.'
  const keywords = homepage?.seo?.keywords || ['Rome tours', 'Colosseum tours', 'Vatican tours', 'skip the line', 'Rome experiences']
  
  // Imagen social optimizada
  const socialImage = homepage?.seo?.socialImage 
    ? urlFor(homepage.seo.socialImage).width(1200).height(630).format('webp').quality(90).url()
    : 'https://colosseumroman.com/images/default-social.webp'

  const baseUrl = 'https://colosseumroman.com'

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'ColosseumRoman' }],
    creator: 'ColosseumRoman',
    publisher: 'ColosseumRoman',
    
    // Open Graph PRO
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: baseUrl,
      title,
      description,
      siteName: 'ColosseumRoman',
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: homepage?.seo?.socialImage?.alt || title,
          type: 'image/webp'
        },
      ],
    },
    
    // Twitter optimizado
    twitter: {
      card: 'summary_large_image',
      site: '@ColosseumRoman',
      creator: '@ColosseumRoman',
      title,
      description,
      images: [socialImage],
    },
    
    // URLs y alternativas
    alternates: {
      canonical: baseUrl,
      languages: {
        'en': baseUrl,
        'x-default': baseUrl,
      },
    },
    
    // Robots ultra-optimizado
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Verificaciones
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    }
  }
}

// ========================================
// 🏆 HOMEPAGE ULTRA-PERFORMANCE
// ========================================
export default async function HomePage() {
  // 🚀 FETCH PARALELO EXTREMO - TODO AL MISMO TIEMPO
  const [homepage, tours, mosaicData, destinations] = await Promise.all([
    getHomepage(),
    getRecommendedTours(),
    getMosaicData(),
    getDestinations()
  ])
  
  // 🆕 SCHEMA.ORG COMPLETO PARA HOMEPAGE
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Colosseum Roman",
    "alternateName": "ColosseumRoman.com",
    "url": "https://colosseumroman.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://colosseumroman.com/logo.png",
      "width": 250,
      "height": 60
    },
    "description": "Expert curators of the best Colosseum tours and comprehensive Rome travel guides since 2006.",
    "foundingDate": "2006",
    
    "founder": {
      "@type": "Person",
      "name": "Mario Dalo",
      "jobTitle": "Founder & Rome Travel Curator",
      "url": "https://linkedin.com/in/mario-dalo"
    },
    
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Larrea 1280",
      "addressLocality": "Buenos Aires",
      "addressRegion": "CABA",
      "postalCode": "C1117",
      "addressCountry": "AR"
    },
    
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@colosseumroman.com",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Spanish"]
    },
    
    "sameAs": [
      "https://linkedin.com/in/mario-dalo",
      "https://instagram.com/colosseumroman",
      "https://featured.com/p/mario-dalo"
    ],
    
    "knowsAbout": [
      "Roman Colosseum",
      "Rome Tourism",
      "Historical Tours",
      "Travel Planning",
      "Ancient Rome History"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Colosseum Roman",
    "alternateName": "ColosseumRoman.com",
    "url": "https://colosseumroman.com",
    "description": "Your expert guide to Colosseum tours and Rome travel planning",
    "publisher": {
      "@type": "Organization",
      "name": "Colosseum Roman",
      "logo": {
        "@type": "ImageObject",
        "url": "https://colosseumroman.com/logo.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://colosseumroman.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // 🆕 ITEMLIST CON FEATURED TOURS (primeros 10)
  const featuredToursSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Featured Colosseum Tours",
    "description": "Top-rated Colosseum tours handpicked by our experts",
    "numberOfItems": Math.min(tours.length, 10),
    "itemListElement": tours.slice(0, 10).map((tour: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://colosseumroman.com/tour/${tour.slug.current}`,
      "name": tour.title
    }))
  };
  
  return (
    <>
      {/* 🆕 SCHEMAS EN <script> TAGS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(featuredToursSchema)
        }}
      />

      {/* Hero - Crítico, renderizado inmediato */}
      <Container>
        <HeroHostel />
      </Container>
      
      {/* Above the fold - Datos pre-cargados */}
      <Container>
        <HostelGrid />
      </Container>
      
      {/* Below the fold - Con Suspense para loading progresivo */}
      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}>
        <Container>
          <TestimonialCarousel />
        </Container>
      </Suspense>
      
      <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse rounded-lg" />}>
        <Container>
          <ImpactBanner />
        </Container>
      </Suspense>
      
      <Container>
        <LugaresPopularesArg />
      </Container>

      <Container>
        <RecommendedTours tours={tours} />
      </Container>

      <Footer />
    </>
  )
}

// ========================================
// 🎯 PERFORMANCE MONITORING
// ========================================
export const runtime = 'nodejs'
export const preferredRegion = 'auto' // Vercel Edge optimizado