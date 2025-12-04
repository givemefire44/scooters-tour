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
import PopularDestinations from "./components/PopularDestinations";

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
  
 const title = homepage?.seo?.title || 'Vespa & Scooter Tours | Book Now, Free Cancellation'
const description = homepage?.seo?.description || 'Book guided Vespa and scooter tours in Rome, Paris, Miami & more. Expert local guides, premium bikes, skip-the-line access. Free cancellation. Reserve now!'
const keywords = homepage?.seo?.keywords || ['vespa tours', 'scooter tours', 'guided vespa tour', 'scooter rental', 'city tours', 'vespa adventures', 'moped tours', 'scooter experiences']
  
  // Imagen social optimizada
  const socialImage = homepage?.seo?.socialImage 
    ? urlFor(homepage.seo.socialImage).width(1200).height(630).format('webp').quality(90).url()
    : 'https://scooterstour.com/images/default-social.webp'

  const baseUrl = 'https://scooterstour.com'

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'ScootersTour' }],
    creator: 'ScootersTour',
    publisher: 'ScootersTour',
    
    // Open Graph PRO
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: baseUrl,
      title,
      description,
      siteName: 'ScootersTour',
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
      site: '@ScootersTour',
      creator: '@ScootersTour',
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
    "name": "Scooters Tour",
    "alternateName": "ScootersTour.com",
    "url": "https://scooterstour.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://scooterstour.com/logo.png",
      "width": 250,
      "height": 60
    },
    "description": "Expert curators of the best scooter and Vespa tours with comprehensive city guides worldwide since 2024.",
    "foundingDate": "2024",
    
    "founder": {
      "@type": "Person",
      "name": "Mario Dalo",
      "jobTitle": "Founder & Travel Specialist",
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
      "email": "hello@scooterstour.com",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Spanish"]
    },
    
    "sameAs": [
      "https://linkedin.com/in/mario-dalo",
      "https://instagram.com/scooterstour",
      "https://featured.com/p/mario-dalo"
    ],
    
   "knowsAbout": [
  "Scooter Tours",
  "Vespa Tours",
  "Guided City Adventures",
  "Urban Exploration",
  "Travel Planning",
  "Local Experiences",
  "Moped Tourism"
]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Scooters Tour",
    "alternateName": "ScootersTour.com",
    "url": "https://scooterstour.com",
    "description": "Your expert guide to scooter tours and urban adventures worldwide",
    "publisher": {
      "@type": "Organization",
      "name": "Scooters Tour",
      "logo": {
        "@type": "ImageObject",
        "url": "https://scooterstour.com/logo.png"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://scooterstour.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // 🆕 ITEMLIST CON FEATURED TOURS (primeros 10)
  const featuredToursSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Featured Scooters Tours",
    "description": "Top-rated Scooters tours handpicked by our experts",
    "numberOfItems": Math.min(tours.length, 10),
    "itemListElement": tours.slice(0, 10).map((tour: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://scooterstour.com/tour/${tour.slug.current}`,
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
 
        <HeroHostel />

           {/* Below the fold - Con Suspense para loading progresivo */}
      {/* <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}> */}
      <Container>
          <TestimonialCarousel />
        </Container>
      {/* </Suspense> */}
      
      
      {/* Above the fold - Datos pre-cargados */}
      <Container>
  <HostelGrid cards={mosaicData} />
</Container>
      
   
      
      {/* <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse rounded-lg" />}> */}
        <Container>
          <ImpactBanner />
        </Container>
      {/* </Suspense> */}
      
      <Container>
  <LugaresPopularesArg destinations={destinations} />
</Container>
      <Container>
        <RecommendedTours tours={tours} />
      </Container>

      <Container>
      <PopularDestinations />
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