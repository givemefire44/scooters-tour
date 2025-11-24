import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { useState, useCallback, useMemo } from 'react';
import styles from './HeroGallery.module.css';

interface HeroGalleryProps {
  post: {
    heroGallery?: Array<{
      asset: {
        url: string;
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
      if (!img.asset?.url) {
        return null;
      }

      try {
        return {
          // 🔥 CORREGIDO - Imagen principal en ALTA RESOLUCIÓN
          mainSrc: index === 0 
            ? urlFor(img)
                .width(1200)
                
                .format('webp')
                .quality(95)
                .fit('max')
                .auto('format')
                .url()
            : urlFor(img)
                .width(600)
                
                .format('webp')
                .quality(90)
                .fit('max')
                .auto('format')
                .url(),
          
          // ✅ Placeholder ultra-comprimido
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

  // ✅ Error handling para imágenes
  const handleImageError = useCallback((index: number) => {
    setImageLoadErrors(prev => new Set([...prev, index]));
  }, []);

  // ✅ EARLY RETURN - Sin imágenes válidas
  if (heroImages.length === 0) {
    return (
      <div className={styles.heroGalleryPlaceholder}>
        <div className={styles.placeholderContent}>
          <p>Images loading...</p>
        </div>
      </div>
    );
  }

  const mainImage = heroImages[0];
  const gridImages = heroImages.slice(1, 5);

  return (
    <div className={styles.heroGallery}>
      
      {/* 🔥 IMAGEN PRINCIPAL - Priority loading */}
      <div className={styles.heroMainImage}>
        {!imageLoadErrors.has(0) && (
          <Image
            src={mainImage.mainSrc}
            alt={mainImage.alt}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 66vw"
            priority={true}
            placeholder="blur"
            blurDataURL={mainImage.placeholder}
            onError={() => handleImageError(0)}
            quality={95}
          />
        )}
      </div>

      {/* ✅ GRID DE IMÁGENES - Lazy loading */}
      {gridImages.length > 0 && (
        <div className={styles.heroGrid}>
          {gridImages.map((image, index) => {
            const actualIndex = index + 1;
            
            return (
              <div key={actualIndex} className={styles.heroGridItem}>
                {!imageLoadErrors.has(actualIndex) && (
                  <Image
                    src={image.mainSrc}
                    alt={image.alt}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 50vw, 30vw"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={image.placeholder}
                    onError={() => handleImageError(actualIndex)}
                    quality={90}
                  />
                )}
                
                {/* Overlay para última imagen si hay más */}
                {index === 3 && heroImages.length > 5 && (
                  <div className={styles.moreImagesOverlay}>
                    <span>+{heroImages.length - 4} more</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}