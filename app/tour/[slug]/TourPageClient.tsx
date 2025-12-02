'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import Container from '../../components/Container';
import Footer from '../../components/Footer';
import SanityContent from '../../components/blog/SanityContent';
import HeroGallery from '../../components/blog/HeroGallery';
import RelatedTours from '../../components/blog/RelatedTours';
import TourNavigation from '../../components/blog/TourNavigation';
import RecommendedTours from '../../components/blog/RecommendedTours';
import MobileTourPage from '../../components/MobileTourPage';
import Breadcrumbs from '../../components/Breadcrumbs';
import RatingDisplay from '../../components/RatingDisplay';
import { generateBreadcrumbs } from '../../utils/breadcrumbGenerator';
import DestinationNavigator from '../../components/DestinationNavigator';

// Hook para detectar mobile
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

interface TourPageClientProps {
  post: any;
  relatedPosts: any[];
  recommendedPosts: any[];
  featuredCategories: any[];
  allCategories: any[];
}

export default function TourPageClient({ 
  post, 
  relatedPosts, 
  recommendedPosts,
  featuredCategories,
  allCategories
}: TourPageClientProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <>
        <MobileTourPage post={post} recommendedTours={recommendedPosts} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Container>
        <h1 className="tour-title">
          {post.title}
        </h1>
        
        {/* ✅ CAMBIO 1: PROVIDER AL LADO DEL RATING */}
        {post.getYourGuideData?.rating && (
          <div style={{ 
            margin: '12px 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <RatingDisplay
              rating={post.getYourGuideData.rating}
              reviewCount={post.getYourGuideData.reviewCount}
              size="medium"
              sourceUrl={post.bookingUrl || post.getYourGuideUrl}
            />
            
            {post.getYourGuideData?.provider && (
              <>
                <span style={{ color: '#dadce0', fontSize: '20px', lineHeight: '1' }}>•</span>
                <span style={{ 
                  color: '#5f6368', 
                  fontSize: '14px',
                  fontWeight: 500
                }}>
                  Provided by: <strong style={{ color: '#202124' }}>{post.getYourGuideData.provider}</strong>
                </span>
              </>
            )}
          </div>
        )}
        
        <Breadcrumbs items={generateBreadcrumbs('tour', {
          title: post.title,
          slug: post.slug.current,
          categoryTitle: post.category?.title,
          categorySlug: post.category?.slug?.current
        })} />
      </Container>

      <Container>
        <HeroGallery post={post} />
      </Container>

      <TourNavigation tourTitle={post.title} />

      <Container>
        <div className="tour-layout" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 300px',
          gap: '40px',
          alignItems: 'start',
          marginBottom: '60px',
          maxWidth: '1150px',
          margin: '0 auto'
        }}>
          
          <div className="tour-content" style={{
            minWidth: 0,
            maxWidth: '100%',
            paddingRight: '20px'
          }}>
            
            <section id="description">
              <SanityContent post={post} />
            </section>

            <section id="details" style={{ marginTop: '40px', marginBottom: '40px' }}>
  <div className="desktop-tour-details-panel">
    <div className="desktop-details-header">
      <span className="desktop-details-icon">📋</span>
      <h3 className="desktop-details-title">Tour Details</h3>
    </div>
    
    <div className="desktop-details-grid">
      {/* ⏱️ DURATION */}
      {post.tourInfo?.duration && (
        <div className="desktop-detail-item">
          <div className="desktop-detail-icon">⏱️</div>
          <div className="desktop-detail-content">
            <div className="desktop-detail-label">Duration</div>
            <div className="desktop-detail-value">{post.tourInfo.duration}</div>
          </div>
        </div>
      )}

      {/* 📍 LOCATION - ✅ VALIDADO */}
      {post.tourInfo?.location && 
       post.tourInfo.location !== 'Unknown City' &&
       post.tourInfo.location.trim().length > 3 && (
        <div className="desktop-detail-item">
          <div className="desktop-detail-icon">📍</div>
          <div className="desktop-detail-content">
            <div className="desktop-detail-label">Location</div>
            <div className="desktop-detail-value">{post.tourInfo.location}</div>
          </div>
        </div>
      )}

      {/* ✅ FREE CANCELLATION */}
      {post.tourFeatures?.freeCancellation && (
        <div className="desktop-detail-item">
          <div className="desktop-detail-icon">✅</div>
          <div className="desktop-detail-content">
            <div className="desktop-detail-label">Cancellation</div>
            <div className="desktop-detail-value">Free cancellation available</div>
          </div>
        </div>
      )}

      {/* ⚡ SKIP THE LINE */}
      {post.tourFeatures?.skipTheLine && (
        <div className="desktop-detail-item">
          <div className="desktop-detail-icon">⚡</div>
          <div className="desktop-detail-content">
            <div className="desktop-detail-label">Access</div>
            <div className="desktop-detail-value">Skip the line entry</div>
          </div>
        </div>
      )}

      {/* ♿ WHEELCHAIR */}
      {post.tourFeatures?.wheelchairAccessible && (
        <div className="desktop-detail-item">
          <div className="desktop-detail-icon">♿</div>
          <div className="desktop-detail-content">
            <div className="desktop-detail-label">Accessibility</div>
            <div className="desktop-detail-value">Wheelchair accessible</div>
          </div>
        </div>
      )}

      {/* 👨‍🏫 GUIDE LANGUAGES - ✅ VALIDADO */}
      {post.tourFeatures?.hostGuide && 
       post.tourFeatures.hostGuide.trim().length > 2 &&
       !['and', 'about', 'top', 'or', 'the'].includes(post.tourFeatures.hostGuide.toLowerCase().trim()) && (
        <div className="desktop-detail-item">
          <div className="desktop-detail-icon">👨‍🏫</div>
          <div className="desktop-detail-content">
            <div className="desktop-detail-label">Guide Languages</div>
            <div className="desktop-detail-value">{post.tourFeatures.hostGuide}</div>
          </div>
        </div>
      )}

      {/* 🎧 AUDIO GUIDE - ✅ VALIDADO */}
      {post.tourFeatures?.audioGuide && 
       post.tourFeatures.audioGuide.trim().length > 2 &&
       !['and', 'about', 'top', 'or', 'the'].includes(post.tourFeatures.audioGuide.toLowerCase().trim()) && (
        <div className="desktop-detail-item">
          <div className="desktop-detail-icon">🎧</div>
          <div className="desktop-detail-content">
            <div className="desktop-detail-label">Audio Guide</div>
            <div className="desktop-detail-value">{post.tourFeatures.audioGuide}</div>
          </div>
        </div>
      )}
      
      {/* 👥 SMALL GROUP */}
      {post.tourFeatures?.smallGroupAvailable && (
        <div className="desktop-detail-item">
          <div className="desktop-detail-icon">👥</div>
          <div className="desktop-detail-content">
            <div className="desktop-detail-label">Group Size</div>
            <div className="desktop-detail-value">Small groups available</div>
          </div>
        </div>
      )}
 
      {/* 💰 PRICE */}
      {post.tourInfo?.price && (
        <div className="desktop-detail-item">
          <div className="desktop-detail-icon">💰</div>
          <div className="desktop-detail-content">
            <div className="desktop-detail-label">Price</div>
            <div className="desktop-detail-value">
              {post.tourInfo.currency === 'USD' && '$'}
              {post.tourInfo.currency === 'EUR' && '€'}
              {post.tourInfo.currency === 'ARS' && 'AR$'}
              {post.tourInfo.price}
              <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: 'normal',
                color: '#666',
                marginLeft: '8px'
              }}>
                per person
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 🏢 PROVIDER */}
      {post.getYourGuideData?.provider && (
        <div className="desktop-detail-item">
          <div className="desktop-detail-icon">🏢</div>
          <div className="desktop-detail-content">
            <div className="desktop-detail-label">Provider</div>
            <div className="desktop-detail-value">{post.getYourGuideData.provider}</div>
          </div>
        </div>
      )}
    </div>
              
                {/* 🆕 RATING AL FINAL DE DETAILS */}
                {post.getYourGuideData?.rating && (
                  <div style={{
                    marginTop: '40px',
                    paddingTop: '30px',
                    borderTop: '2px solid #f1f3f4',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <h4 style={{
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      color: '#202124',
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      ⭐ Guest Reviews
                    </h4>
                    <RatingDisplay
                      rating={post.getYourGuideData.rating}
                      reviewCount={post.getYourGuideData.reviewCount}
                      size="large"
                      sourceUrl={post.bookingUrl || post.getYourGuideUrl}
                    />
                    <p style={{
                      fontSize: '14px',
                      color: '#5f6368',
                      textAlign: 'center',
                      maxWidth: '500px',
                      lineHeight: '1.6',
                      marginTop: '8px'
                    }}>
                      Verified reviews from travelers who booked this tour through GetYourGuide
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section id="related" style={{ marginTop: '60px', marginBottom: '40px' }}>
              <RelatedTours tours={relatedPosts} />
            </section>

            <section id="recommended" style={{ marginTop: '40px', marginBottom: '40px' }}>
              <RecommendedTours tours={recommendedPosts} />
            </section>

            <div id="cancellations" style={{ height: '1px', marginTop: '-120px', paddingTop: '120px' }}></div>
          </div>
          
          <div className="tour-widget" style={{
            position: 'sticky',
            top: '20px',
            width: '300px',
            height: 'fit-content',
            alignSelf: 'start'
          }}>
            <div id="book-now">
              <div style={{
                width: '100%',
                maxWidth: '300px',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                
                <div style={{ padding: '60px 20px 25px 20px' }}>
                  <a 
                    href={post.bookingUrl || post.getYourGuideUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      background: '#e91e63',
                      color: 'white',
                      padding: '12px 20px',
                      borderRadius: '25px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    Check Availability
                  </a>
                </div>

                <div style={{ padding: '0 20px 25px 20px' }}>
                  <div style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: '300px', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }} onClick={() => window.open(post.bookingUrl || post.getYourGuideUrl || '#', '_blank')}>
                    <Image
                      src={urlFor(post.heroGallery?.[0] || post.mainImage)
                        .width(300)
                        .height(300)
                        .format('webp')
                        .quality(85)
                        .fit('crop')
                        .url()}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="300px"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                </div>

                <div style={{ padding: '0px 20px 10px 20px' }}>
                  <a 
                    href={post.bookingUrl || post.getYourGuideUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      background: '#e91e63',
                      color: 'white',
                      padding: '12px 20px',
                      borderRadius: '25px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    Tour Details
                  </a>
                </div>

                <div style={{ 
                  padding: '10px 20px 20px 20px',
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '5px' 
                  }}>
                    <span style={{ marginRight: '8px' }}>⚡</span>
                    <span>Instant Confirmation</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '5px' 
                  }}>
                    <span style={{ marginRight: '8px' }}>❌</span>
                    <span>Free Cancelation Option</span>
                  </div>
                </div>
              </div>
            </div>

            <DestinationNavigator 
              allDestinations={allCategories}
            />
          </div>
        </div>
      </Container>

      <Footer />

      {/* ✅ CAMBIO 3: SCHEMA.ORG JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: post.title,
            description: post.seoDescription,
            image: post.heroGallery?.[0] 
              ? urlFor(post.heroGallery[0]).width(1200).height(630).url()
              : undefined,
            offers: {
              '@type': 'Offer',
              price: post.tourInfo?.price,
              priceCurrency: post.tourInfo?.currency || 'USD',
              availability: 'https://schema.org/InStock',
              url: post.bookingUrl || post.getYourGuideUrl
            },
            provider: post.getYourGuideData?.provider ? {
              '@type': 'Organization',
              name: post.getYourGuideData.provider
            } : undefined,
            brand: post.tourInfo?.platform ? {
              '@type': 'Organization',
              name: post.tourInfo.platform
            } : undefined,
            aggregateRating: post.getYourGuideData?.rating ? {
              '@type': 'AggregateRating',
              ratingValue: post.getYourGuideData.rating,
              reviewCount: post.getYourGuideData.reviewCount,
              bestRating: 5,
              worstRating: 1
            } : undefined
          })
        }}
      />

      <style jsx>{`
        .desktop-tour-details-panel {
          margin: 40px 0;
          max-width: 100%;
        }

        .desktop-details-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f1f3f4;
        }

        .desktop-details-icon {
          font-size: 28px;
        }

        .desktop-details-title {
          font-size: 1.4rem;
          font-weight: 600;
          margin: 0;
          color: #202124;
        }

        .desktop-details-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .desktop-detail-item {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          padding: 0;
          margin: 0;
        }

        .desktop-detail-icon {
          font-size: 32px;
          width: 40px;
          text-align: left;
          margin-top: 3px;
          flex-shrink: 0;
        }

        .desktop-detail-content {
          flex: 1;
          padding-top: 2px;
        }

        .desktop-detail-label {
          font-size: 15px;
          color: #5f6368;
          font-weight: 500;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .desktop-detail-value {
          font-size: 17px;
          color: #202124;
          font-weight: 700;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .desktop-tour-details-panel {
            display: none;
          }
        }
      `}</style>
    </>
  );
}