import Head from 'next/head';
import { urlFor } from '@/sanity/lib/image';

interface SEOHeadProps {
  // Datos básicos
  title: string;
  description: string;
  canonical: string;
  
  // Datos SEO de Sanity
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoImage?: {
    asset: { url: string };
    alt?: string;
  };
  
  // Datos del tour para Schema.org
  tourInfo?: {
    duration?: string;
    price?: number;
    currency?: string;
    location?: string;
    provider?: string;
  };
  
  // Opcionales
  publishedAt?: string;
  siteName?: string;
  language?: string;
}

export default function SEOHead({
  title,
  description,
  canonical,
  seoTitle,
  seoDescription,
  seoKeywords = [],
  seoImage,
  tourInfo,
  publishedAt,
  siteName = "ColosseumRoman.com",
  language = "en"
}: SEOHeadProps) {
  
  // Usar SEO title si existe, sino el title normal
  const finalTitle = seoTitle || title;
  const finalDescription = seoDescription || description;
  
  // Construir URL de imagen social
  const socialImageUrl = seoImage 
    ? urlFor(seoImage).width(1200).height(630).url()
    : '/images/default-social.jpg'; // Imagen por defecto
  
  const socialImageAlt = seoImage?.alt || finalTitle;
  
  // Keywords como string (SEGURO)
  const keywordsString = seoKeywords && seoKeywords.length > 0 
    ? seoKeywords.join(', ') 
    : '';
  
  // Schema.org JSON-LD para tours
  const tourSchema = tourInfo ? {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": finalTitle,
    "description": finalDescription,
    "url": canonical,
    "image": socialImageUrl,
    ...(tourInfo.location && { "address": tourInfo.location }),
    ...(publishedAt && { "datePublished": publishedAt }),
    ...(tourInfo.duration && { 
      "duration": tourInfo.duration 
    }),
    ...(tourInfo.price && tourInfo.currency && {
      "offers": {
        "@type": "Offer",
        "price": tourInfo.price,
        "priceCurrency": tourInfo.currency,
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": tourInfo.provider || siteName
        }
      }
    })
  } : null;

  return (
    <Head>
      {/* ========================================
          META TAGS BÁSICOS
          ======================================== */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      <meta name="robots" content="index, follow" />
      <meta name="language" content={language} />
      <meta name="author" content={siteName} />
      
      {/* CANONICAL URL */}
      <link rel="canonical" href={canonical} />
      
      {/* ========================================
          OPEN GRAPH (FACEBOOK, WHATSAPP)
          ======================================== */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={socialImageUrl} />
      <meta property="og:image:alt" content={socialImageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="es_ES" />
      
      {/* ========================================
          TWITTER CARDS
          ======================================== */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={socialImageUrl} />
      <meta name="twitter:image:alt" content={socialImageAlt} />
      
      {/* ========================================
          ADDITIONAL SEO
          ======================================== */}
      <meta name="theme-color" content="#e91e63" />
      <meta name="msapplication-TileColor" content="#e91e63" />
      
      {/* LANGUAGE/LOCALE */}
      <meta httpEquiv="content-language" content={language} />
      <link rel="alternate" hrefLang={language} href={canonical} />
      
      {/* ========================================
          SCHEMA.ORG STRUCTURED DATA
          ======================================== */}
      {tourSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(tourSchema, null, 2)
          }}
        />
      )}
      
      {/* WEBSITE SCHEMA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": siteName,
            "url": canonical.split('/').slice(0, 3).join('/'),
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${canonical.split('/').slice(0, 3).join('/')}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          }, null, 2)
        }}
      />
    </Head>
  );
}