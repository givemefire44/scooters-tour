import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { useState, useCallback, useMemo } from 'react';

interface HeroGalleryProps {
  post: {
    heroGallery?: Array<{
      asset: {
        url: string;      // ← CAMBIADO: _ref por url
        _type: string;
      };
      alt?: string;
    }>;
  };
}

export default function HeroGallery({ post }: HeroGalleryProps) {
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  
  // ✅ MEMOIZED - Procesamiento de imágenes optimizado
  const heroImages = useMemo(() => {
    return post.heroGallery?.slice(0, 5).map((img, index) => {
      if (!img.asset?.url) {  // ← CAMBIADO: _ref por url
        return null;
      }

      try {
        return {
          // ✅ OPTIMIZACIÓN - Diferentes tamaños para diferentes posiciones
          mainSrc: index === 0 
            ? urlFor(img)
                .width(800)
                .height(600)
                .format('webp')
                .quality(90)
                .fit('crop')
                .auto('format')
                .url()
            : urlFor(img)
                .width(400)
                .height(300)
                .format('webp')
                .quality(85)
                .fit('crop')
                .auto('format')
                .url(),
          
          // ✅ OPTIMIZACIÓN - Placeholder ultra-comprimido
          placeholder: urlFor(img)
            .width(20)
            .height(15)
            .blur(10)
            .quality(20)
            .format('webp')
            .url(),
            
          alt: img.alt || `Tour image ${index + 1}`
        };
      } catch (error) {
        console.error('Error processing image:', error);
        return null;
      }
    }).filter(Boolean) || [];
  }, [post.heroGallery]);

  // ✅ OPTIMIZADO - Error handling para imágenes
  const handleImageError = useCallback((index: number) => {
    setImageLoadErrors(prev => new Set([...prev, index]));
  }, []);

  // ✅ EARLY RETURN - Sin imágenes válidas
  if (heroImages.length === 0) {
    return (
      <div className="hero-gallery-placeholder">
        <div className="placeholder-content">
          <p>Images loading...</p>
        </div>
      </div>
    );
  }

  const mainImage = heroImages[0];
  const gridImages = heroImages.slice(1, 5);

  return (
    <>
      <div className="hero-gallery">
        
        {/* ✅ IMAGEN PRINCIPAL - Priority loading */}
        <div className="hero-main-image">
          {!imageLoadErrors.has(0) && (
            <Image
              src={mainImage.mainSrc}
              alt={mainImage.alt}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 60vw"
              priority={true}
              placeholder="blur"
              blurDataURL={mainImage.placeholder}
              onError={() => handleImageError(0)}
              // ✅ OPTIMIZACIÓN - Callback optimizado
              onLoad={() => {
                // Preload siguiente imagen
                if (gridImages.length > 0) {
                  const link = document.createElement('link');
                  link.rel = 'preload';
                  link.as = 'image';
                  link.href = gridImages[0].mainSrc;
                  document.head.appendChild(link);
                }
              }}
            />
          )}
        </div>

        {/* ✅ GRID DE IMÁGENES - Lazy loading optimizado */}
        {gridImages.length > 0 && (
          <div className="hero-grid">
            {gridImages.map((image, index) => {
              const actualIndex = index + 1; // +1 porque excluimos la imagen principal
              
              return (
                <div key={actualIndex} className="hero-grid-item">
                  {!imageLoadErrors.has(actualIndex) && (
                    <Image
                      src={image.mainSrc}
                      alt={image.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={image.placeholder}
                      onError={() => handleImageError(actualIndex)}
                      // ✅ OPTIMIZACIÓN - Intersection observer manual
                      onLoad={() => {
                        // Preload próxima imagen si existe
                        if (gridImages[index + 1]) {
                          setTimeout(() => {
                            const link = document.createElement('link');
                            link.rel = 'preload';
                            link.as = 'image';
                            link.href = gridImages[index + 1].mainSrc;
                            document.head.appendChild(link);
                          }, 100);
                        }
                      }}
                    />
                  )}
                  
                  {/* ✅ Overlay para última imagen si hay más */}
                  {index === 3 && heroImages.length > 5 && (
                    <div className="more-images-overlay">
                      <span>+{heroImages.length - 4} more</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ CSS OPTIMIZADO - Con GPU acceleration */}
      <style jsx>{`
        .hero-gallery {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 8px;
          height: 400px;
          margin-bottom: 40px;
          border-radius: 12px;
          overflow: hidden;
          
          /* ✅ OPTIMIZACIÓN - GPU acceleration */
          will-change: transform;
          transform: translateZ(0);
          
          /* ✅ OPTIMIZACIÓN - Contenment para mejor layout */
          contain: layout style paint;
        }

        .hero-main-image {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
          
          /* ✅ OPTIMIZACIÓN - Reduce repaints */
          contain: layout style paint;
        }

        .hero-grid {
          display: grid;
          grid-template-rows: repeat(2, 1fr);
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          height: 100%;
          
          /* ✅ OPTIMIZACIÓN - GPU acceleration */
          will-change: transform;
          transform: translateZ(0);
        }

        .hero-grid-item {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
          
          /* ✅ OPTIMIZACIÓN - Smooth transitions */
          transition: transform 0.2s ease;
          will-change: transform;
        }

        .hero-grid-item:hover {
          transform: scale(1.02);
        }

        .more-images-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
          font-weight: bold;
          
          /* ✅ OPTIMIZACIÓN - GPU layer */
          will-change: opacity;
          backdrop-filter: blur(2px);
        }

        .hero-gallery-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 400px;
          background: #f5f5f5;
          border-radius: 12px;
          margin-bottom: 40px;
        }

        .placeholder-content {
          text-align: center;
          color: #666;
        }

        /* ✅ RESPONSIVE - Mobile optimizations */
        @media (max-width: 768px) {
          .hero-gallery {
            grid-template-columns: 1fr;
            height: 300px;
          }
          
          .hero-grid {
            display: none; /* Simplificar en mobile */
          }
        }

        /* ✅ OPTIMIZACIÓN - Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-grid-item {
            transition: none;
          }
          
          .hero-grid-item:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
}