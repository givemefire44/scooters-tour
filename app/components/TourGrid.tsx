'use client';

import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

interface TourGridProps {
  posts: any[];
  emptyMessage?: string;
}

function getBestImage(post: any) {
  if (post.heroGallery?.[0]?.asset?.url) return post.heroGallery[0];
  if (post.seoImage?.asset?.url) return post.seoImage;
  if (post.image) return post.image;
  return null;
}

export default function TourGrid({ posts, emptyMessage = "No tours found" }: TourGridProps) {
  if (posts.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '16px'
        }}>
          {emptyMessage}
        </h2>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
      gap: '20px'
    }}>
      {posts.map((post: any) => {
        const image = getBestImage(post);
        const slug = post.slug?.current || post.slug;

        return (
          <div
            key={slug}
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
            <a href={`/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
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

                {/* RATING */}
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

                {/* BADGES */}
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
  );
}