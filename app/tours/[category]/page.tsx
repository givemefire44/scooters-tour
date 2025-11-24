import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import Container from '@/app/components/Container';
import RecommendedTours from '@/app/components/blog/RecommendedTours';
import Footer from '@/app/components/Footer';
import Breadcrumbs from '@/app/components/Breadcrumbs';
// 🆕 IMPORTS NUEVOS
import CategoryFAQ from '@/app/components/CategoryFAQ';
import CategoryEditorialContent from '@/app/components/CategoryEditorialContent';

// 🆕 CONFIGURACIÓN DEL SITIO
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scooterstour.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'ScootersTour';

// ✅ CONFIGURACIÓN DE CACHE CONSISTENTE
const cacheConfig = {
  next: { revalidate: 3600 }
};

async function getCategory(slug: string) {
  const query = `*[_type == "category" && slug.current == $slug][0]{
    title,
    slug,
    description,
    longDescription,
    featuredText,
    seoTitle,
    seoDescription,
    seoKeywords,
    seoImage {
      asset-> {
        url
      },
      alt
    },
    image {
      asset-> {
        url
      },
      alt,
      heading
    },
    pageContent{
      heroTitle,
      heroSubtitle,
      highlights[]
    },
    faqs[]{
      question,
      answer
    },
    metaTitle,
    metaDescription
  }`;

  const result = await client.fetch(query, { slug }, cacheConfig);
  console.log('CATEGORY DEBUG:', result);
  return result;
}

// 🆕 QUERY CON RATING Y FEATURES
async function getPostsByCategory(categorySlug: string) {
  const query = `*[_type == "post" && category->slug.current == $categorySlug]| order(_createdAt desc)[0...200]{
    title,
    slug,
    seoDescription,
    seoImage {
      asset-> {
        url
      },
      alt
    },
    heroGallery[] {
      asset-> {
        url
      },
      alt
    },
    tourInfo{
      duration,
      price,
      currency
    },
    tourFeatures{
      skipTheLine,
      smallGroupAvailable,
      freeCancellation
    },
    getYourGuideData{
      rating,
      reviewCount
    },
    "categoryTitle": category->title
  }`;

  const result = await client.fetch(query, { categorySlug }, cacheConfig);
  console.log('POSTS DEBUG:', result);
  console.log('POSTS COUNT:', result.length);
  return result;
}

async function getRecommendedTours() {
  const query = `*[_type == "post"] | order(_createdAt desc)[0...60] {
    _id,
    title,
    slug,
    mainImage {
      asset-> {
        url
      },
      alt
    },
    heroGallery[] {
      asset-> {
        url
      },
      alt
    },
    body
  }`;

  return await client.fetch(query, {}, {
    next: { revalidate: 1800 }
  });
}

function getBestImage(post: any) {
  if (post.heroGallery?.[0]?.asset?.url) {
    return post.heroGallery[0];
  }
  if (post.seoImage?.asset?.url) {
    return post.seoImage;
  }
  return null;
}

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategory(categorySlug);

  if (!category) {
    return {};
  }

  const canonical = `${SITE_URL}/tours/${category.slug.current}`;

  const title = category.seoTitle || category.metaTitle || `${category.title} Tours | ${SITE_NAME}`;
  const description = category.seoDescription || category.metaDescription || category.description || `Discover amazing ${category.title} tours and experiences`;
  const keywords = category.seoKeywords || [category.title.toLowerCase(), 'tours', 'experiences', 'scooter'];

  const socialImage = category.seoImage?.asset?.url
    ? urlFor(category.seoImage).width(1200).height(630).format('webp').quality(85).url()
    : category.image?.asset?.url
      ? urlFor(category.image).width(1200).height(630).format('webp').quality(85).url()
      : `${SITE_URL}/images/default-category.jpg`;

  return {
    title,
    description,
    keywords,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,

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
          alt: category.seoImage?.alt || category.image?.alt || title,
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
  };
}

export default async function ToursCategory({ params }: PageProps) {
  const { category: categorySlug } = await params;
  const category = await getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(categorySlug);
  const recommendedTours = await getRecommendedTours();

  // ✅ OBTENER FAQs DESDE SANITY
  const categoryFAQs = category.faqs || [];

  // ✅ NUEVO: Calcular fecha de validez del precio (1 año adelante)
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);
  const priceValidUntilString = priceValidUntil.toISOString().split('T')[0];

  // 🆕 CALCULAR RATING PROMEDIO DE LA CATEGORÍA
  const toursWithRating = posts.filter(p => p.getYourGuideData?.rating);
  const avgRating = toursWithRating.length > 0
    ? toursWithRating.reduce((sum, p) => sum + p.getYourGuideData.rating, 0) / toursWithRating.length
    : 0;
  const totalReviews = toursWithRating.reduce((sum, p) => sum + (p.getYourGuideData.reviewCount || 0), 0);

  // 🆕 SCHEMA COMPLETO CON ITEMLIST DETALLADO Y FAQ
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.seoTitle || `${category.title} Tours`,
    "description": category.seoDescription || category.description,
    "url": `${SITE_URL}/tours/${category.slug.current}`,
    "image": category.seoImage?.asset?.url || category.image?.asset?.url,

    // 🆕 ORGANIZATION
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },

    "about": {
      "@type": "TouristDestination",
      "name": category.title,
      "description": category.longDescription || category.description,
      "url": `${SITE_URL}/tours/${category.slug.current}`
    },

    // ✅ LISTA DE TOURS
    "hasPart": {
      "@type": "ItemList",
      "name": `${category.title} Tours Collection`,
      "description": `Curated tours and experiences in ${category.title}`,
      "numberOfItems": posts.length,
      "url": `${SITE_URL}/tours/${category.slug.current}`,

      // 🆕 CADA TOUR COMO LISTITEM CON DATOS COMPLETOS
      "itemListElement": posts.map((post: any, index: number) => {
        const image = getBestImage(post);

        return {
          "@type": "ListItem",
          "position": index + 1,
          "url": `${SITE_URL}/tour/${post.slug.current}`,
          "item": {
            "@type": "Product",
            "name": post.title,
            "description": post.seoDescription || post.title,
            ...(image && {
              "image": urlFor(image).width(800).height(400).format('webp').quality(85).url()
            }),

            // 🆕 OFFER (PRECIO)
            ...(post.tourInfo?.price && {
              "offers": {
                "@type": "Offer",
                "price": post.tourInfo.price,
                "priceCurrency": post.tourInfo.currency || "USD",
                "priceValidUntil": priceValidUntilString,
                "availability": "https://schema.org/InStock",
                "url": `${SITE_URL}/tour/${post.slug.current}`,
                "seller": {
                  "@type": "Organization",
                  "name": SITE_NAME
                }
              }
            }),

            // 🆕 AGGREGATE RATING DEL TOUR
            ...(post.getYourGuideData?.rating && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": post.getYourGuideData.rating.toFixed(1),
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": post.getYourGuideData.reviewCount || 1
              }
            }),

            // 🆕 CARACTERÍSTICAS DESTACADAS
            "additionalProperty": [
              ...(post.tourInfo?.duration ? [{
                "@type": "PropertyValue",
                "name": "Duration",
                "value": post.tourInfo.duration
              }] : []),
              ...(post.tourFeatures?.skipTheLine ? [{
                "@type": "PropertyValue",
                "name": "Skip the Line",
                "value": "true"
              }] : []),
              ...(post.tourFeatures?.freeCancellation ? [{
                "@type": "PropertyValue",
                "name": "Free Cancellation",
                "value": "true"
              }] : []),
              ...(post.tourFeatures?.smallGroupAvailable ? [{
                "@type": "PropertyValue",
                "name": "Small Group Available",
                "value": "true"
              }] : [])
            ]
          }
        };
      })
    },

    // 🆕 FAQ ESTRUCTURADAS
    "mainEntity": categoryFAQs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    })),

    // BREADCRUMB
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Scooter Tours Guide",
          "item": `${SITE_URL}/guide`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": `${category.title} Tours`,
          "item": `${SITE_URL}/tours/${category.slug.current}`
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categorySchema)
        }}
      />

      <Container>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1a1a1a',
          lineHeight: '1.1'
        }}>
          {category.pageContent?.heroTitle || category.title}
        </h1>

        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          {
            label: 'Scooter Tours Guide',
            href: '/guide'
          },
          { label: `${category.title} Tours`, isActive: true }
        ]} />

        {(category.pageContent?.heroSubtitle || category.description) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🛵</span>
            <span style={{
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: '1.6'
            }}>
              {category.pageContent?.heroSubtitle || category.description}
            </span>
          </div>
        )}
      </Container>
      <Container>
      <div style={{
  position: 'relative',
  aspectRatio: '3 / 1',
  width: '100%',
  overflow: 'hidden',
  marginBottom: '3rem',
  borderRadius: '12px'
}}>
       <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: category.image?.asset?.url ?
              `url(${urlFor(category.image).width(1200).format('webp').quality(85).url()})` :
              'linear-gradient(135deg, #8816c0 0%, #8f3985 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />

          {category.pageContent?.highlights && category.pageContent.highlights.length > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '20px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                gap: '15px',
                flexWrap: 'wrap'
              }}>
                {category.pageContent.highlights.map((highlight: any, index: number) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8f9fa',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid #e9ecef',
                    fontSize: '0.9rem'
                  }}>
                    <span style={{ fontSize: '1rem' }}>{highlight.icon}</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>{highlight.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
      
       {/* 🆕 CONTENIDO EDITORIAL */}
       {category.longDescription && (
        <Container>
         <CategoryEditorialContent 
  cityName={category.title
    .replace(/:.*$/, '')
    .replace(/\s*(Vespa|Scooter)\s*Tours?/gi, '')
    .trim()}
  content={category.longDescription}
/>
        </Container>
      )}
      
   <Container>
         <div style={{ padding: '24px 0 60px 0' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '40px',
            color: '#333'
          }}>
            Continue planning
          </h2>

          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '1.1rem', color: '#666' }}>
                No hay tours disponibles para {category.title} aún.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
              gap: '20px'
            }}>
              {posts.map((post: any) => {
                const image = getBestImage(post);

                return (
                  <div
                    key={post.slug.current}
                    style={{
                      background: '#fff',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      minWidth: '260px',
                      maxWidth: '300px',
                      justifySelf: 'center'
                    }}
                  >
                    <a href={`/tour/${post.slug.current}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ position: 'relative', height: '160px' }}>
                        {image ? (
                          <Image
                            src={urlFor(image)
                              .width(350)
                              .height(160)
                              .format('webp')
                              .quality(80)
                              .fit('crop')
                              .url()}
                            alt={image.alt || post.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem'
                          }}>
                            🛵
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '16px' }}>
                        <h3 style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          marginBottom: '8px',
                          color: '#333',
                          lineHeight: '1.3',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.6rem'
                        }}>
                          {post.title}
                        </h3>

                        {/* 🆕 RATING */}
                        {post.getYourGuideData?.rating && (
                          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill={i < Math.floor(post.getYourGuideData.rating) ? '#FBBF24' : '#E5E7EB'}
                                >
                                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                              ))}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333' }}>
                              {post.getYourGuideData.rating.toFixed(1)}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              ({post.getYourGuideData.reviewCount})
                            </span>
                          </div>
                        )}

                        {/* 🆕 BADGES */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                          {post.tourFeatures?.skipTheLine && (
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              background: '#dcfce7',
                              color: '#16a34a',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              ⚡ Skip the line
                            </span>
                          )}
                          {post.tourFeatures?.smallGroupAvailable && (
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              background: '#dbeafe',
                              color: '#2563eb',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              👥 Small group
                            </span>
                          )}
                          {post.tourFeatures?.freeCancellation && (
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              background: '#fef3c7',
                              color: '#d97706',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              🔄 Free cancel
                            </span>
                          )}
                        </div>

                        {post.seoDescription && (
                          <p style={{
                            fontSize: '0.85rem',
                            color: '#666',
                            lineHeight: '1.4',
                            marginBottom: '10px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.4rem'
                          }}>
                            {post.seoDescription.substring(0, 80)}...
                          </p>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                          {post.tourInfo?.duration && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#666',
                              fontSize: '0.8rem'
                            }}>
                              <span>🕒</span>
                              <span>{post.tourInfo.duration}</span>
                            </div>
                          )}
                          {post.tourInfo?.price && (
                            <div style={{
                              fontSize: '1.1rem',
                              fontWeight: '700',
                              color: '#e91e63'
                            }}>
                              {post.tourInfo.currency === 'USD' && '$'}
                              {post.tourInfo.currency === 'EUR' && '€'}
                              {post.tourInfo.price}
                            </div>
                          )}
                        </div>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>

      <Container>
        <RecommendedTours tours={recommendedTours} />
      </Container>

      {/* 🆕 FAQ SECTION */}
      <CategoryFAQ faqs={categoryFAQs} />

      <Footer />
    </>
  );
}