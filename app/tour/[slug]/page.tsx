import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { Metadata } from 'next';
import TourPageClient from './TourPageClient';

// 🆕 CONFIGURACIÓN DEL SITIO
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scooterstour.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'ScootersTour';

// ========================================
// GENERAR METADATA DINÁMICO CON STRUCTURED DATA - Next.js 15
// ========================================
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  // Traer datos SEO del post - CON CONFIGURACIÓN DE CACHÉ CORRECTA
  const post = await client.fetch(`
    *[_type == "post" && slug.current == $slug][0]{
      title,
      slug,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoImage{
        asset->{
          url
        },
        alt
      },
      tourInfo{
        duration,
        price,
        currency,
        location,
        provider
      },
      publishedAt
    }
  `, { slug }, {
    next: { revalidate: 3600 } // Revalida cada hora
  });

  if (!post) {
    return {
      title: 'Tour not found',
      description: 'This tour doesn\'t exist.'
    };
  }

  // Construir URLs
  const canonical = `${SITE_URL}/tour/${post.slug.current}`;
  
  // Imagen social
  const socialImage = post.seoImage 
    ? urlFor(post.seoImage).width(1200).height(630).url()
    : `${SITE_URL}/images/default-social.jpg`;

  // Título y descripción finales
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || `Discover ${post.title} - Complete tour with expert guide`;

  return {
    title,
    description,
    keywords: post.seoKeywords || [],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: post.seoImage?.alt || title,
        },
      ],
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
    
    // Otros meta tags
    alternates: {
      canonical,
      languages: {
        'en': canonical,
      },
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    
    // Verification
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    }
  };
}

// ✅ Componente principal con params async - Next.js 15
export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // TODAS LAS CONSULTAS CON CONFIGURACIÓN DE CACHÉ CONSISTENTE
  const cacheConfig = {
    next: { revalidate: 1800 } // 30 minutos - ajusta según necesites
  };
  
  // 🆕 Consulta del post actual CON GETYOURGUIDE DATA
  const post = await client.fetch(`
    *[_type == "post" && slug.current == $slug][0]{
      title,
      slug,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoImage{
        asset->{
          url
        },
        alt
      },
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
      body,
      publishedAt,
      author->{
        name
      },
      tourInfo{
        duration,
        price,
        currency,
        location,
        provider
      },
      tourFeatures{
        freeCancellation,
        skipTheLine,
        wheelchairAccessible,
        hostGuide,
        audioGuide,
        smallGroupAvailable
      },
      getYourGuideTourId,
      getYourGuideUrl,
      bookingUrl,
      getYourGuideData{
        rating,
        reviewCount,
        lastUpdated
      }
    }
  `, { slug }, cacheConfig);

  // Query para posts relacionados (excluyendo el actual)
  const relatedPosts = await client.fetch(`
    *[_type == "post" && slug.current != $slug][0...3]{
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
  `, { slug }, cacheConfig);

  // Query para posts recomendados (10 posts random, excluyendo el actual)
  const recommendedPosts = await client.fetch(`
    *[_type == "post" && slug.current != $slug] | order(_createdAt desc)[0...60]{
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
  `, { slug }, cacheConfig);

  if (!post) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h1>Tour not found</h1>
        <p>This tour doesn't exist.</p>
      </div>
    );
  }

  // ✅ NUEVO: Calcular fecha de validez del precio (1 año adelante)
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);
  const priceValidUntilString = priceValidUntil.toISOString().split('T')[0];

  // 🆕 STRUCTURED DATA MEJORADO CON RATINGS - Next.js 15
  const tourSchema = post.tourInfo ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": post.seoTitle || post.title,
    "description": post.seoDescription || `Discover ${post.title} with expert guides`,
    "url": `${SITE_URL}/tour/${post.slug.current}`,
    "category": "Tour",
    
    // Imagen principal
    ...(post.seoImage && {
      "image": {
        "@type": "ImageObject",
        "url": urlFor(post.seoImage).width(1200).height(630).url(),
        "alt": post.seoImage.alt || post.title
      }
    }),

    // 🆕 Marca/Proveedor - GetYourGuide
    "brand": {
      "@type": "Organization",
      "name": "GetYourGuide",
      "url": "https://www.getyourguide.com"
    },

    // Ubicación donde se realiza el tour
    ...(post.tourInfo.location && {
      "location": {
        "@type": "Place",
        "name": post.tourInfo.location,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": post.tourInfo.location
        }
      }
    }),

    // 🆕 RATING AGREGADO - CRÍTICO PARA SEO
    ...(post.getYourGuideData?.rating && post.getYourGuideData?.reviewCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": post.getYourGuideData.rating,
        "reviewCount": post.getYourGuideData.reviewCount,
        "bestRating": 5,
        "worstRating": 1
      }
    }),

    // Ofertas con precios (solo si hay precio)
    ...(post.tourInfo.price && post.tourInfo.currency && {
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "price": post.tourInfo.price,
        "priceCurrency": post.tourInfo.currency,
        "priceValidUntil": priceValidUntilString,
        "url": post.bookingUrl || post.getYourGuideUrl || `${SITE_URL}/tour/${post.slug.current}`,
        "seller": {
          "@type": "Organization",
          "name": "GetYourGuide",
          "url": "https://www.getyourguide.com"
        },
        
        // CARACTERÍSTICAS DEL TOUR (usando tourFeatures)
        ...(post.tourFeatures && Object.values(post.tourFeatures).some(Boolean) && {
          "additionalProperty": [
            ...(post.tourFeatures.freeCancellation ? [{
              "@type": "PropertyValue",
              "name": "Free Cancellation",
              "value": "Available"
            }] : []),
            ...(post.tourFeatures.skipTheLine ? [{
              "@type": "PropertyValue", 
              "name": "Skip the Line",
              "value": "Included"
            }] : []),
            ...(post.tourFeatures.wheelchairAccessible ? [{
              "@type": "PropertyValue",
              "name": "Wheelchair Accessible", 
              "value": "Yes"
            }] : []),
            ...(post.tourFeatures.smallGroupAvailable ? [{
              "@type": "PropertyValue",
              "name": "Small Groups",
              "value": "Available"
            }] : []),
            ...(post.tourFeatures.hostGuide ? [{
              "@type": "PropertyValue",
              "name": "Guide Languages",
              "value": post.tourFeatures.hostGuide
            }] : []),
            ...(post.tourFeatures.audioGuide ? [{
              "@type": "PropertyValue",
              "name": "Audio Guide",
              "value": post.tourFeatures.audioGuide
            }] : [])
          ].filter(Boolean)
        })
      }
    }),

    // Propiedades adicionales del producto
    "additionalProperty": [
      ...(post.tourInfo.duration ? [{
        "@type": "PropertyValue",
        "name": "Duration",
        "value": post.tourInfo.duration
      }] : []),
      ...(post.publishedAt ? [{
        "@type": "PropertyValue",
        "name": "Available Since",
        "value": new Date(post.publishedAt).getFullYear().toString()
      }] : [])
    ].filter(Boolean),

    // Organización proveedora
    "provider": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL
    }
  } : null;

  return (
    <>
      {/* STRUCTURED DATA - Next.js 15 style */}
      {tourSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(tourSchema)
          }}
        />
      )}
      
      <TourPageClient 
        post={post}
        relatedPosts={relatedPosts}
        recommendedPosts={recommendedPosts}
      />
    </>
  );
}