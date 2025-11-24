'use client'
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';

// Función para generar IDs automáticamente
function generateSectionId(children: any): string {
  if (!children) return '';
  
  let text = '';
  if (typeof children === 'string') {
    text = children;
  } else if (Array.isArray(children)) {
    text = children.map(child => 
      typeof child === 'string' ? child : (child?.props?.children || '')
    ).join(' ');
  }
  
  const cleanText = text.toLowerCase().trim();
  
  if (cleanText.includes('detail')) return 'details';
  if (cleanText.includes('cancel')) return 'cancellations';
  
  return '';
}

interface SanityContentProps {
  post: {
    title: string;
    slug?: {
      current: string;
    };
    mainImage?: {
      asset: {
        url: string;
      };
      alt?: string;
    };
    body?: any;
    content?: any; // 🆕 Para páginas estáticas
  };
}

export default function SanityContent({ post }: SanityContentProps) {
  // 🔍 DEBUG TEMPORAL - VER QUÉ DATOS LLEGAN
  console.log('🔍 DEBUG - Post completo:', JSON.stringify(post, null, 2));
  console.log('🔍 DEBUG - Content:', post.content);
  console.log('🔍 DEBUG - Body:', post.body);
  
  // 🆕 USAR EL CONTENIDO CORRECTO (body para blogs, content para páginas)
  const contentToRender = post.content || post.body;
  
  // 🔍 DEBUG TEMPORAL - VER CONTENIDO A RENDERIZAR
  console.log('🔍 DEBUG - Content to render:', contentToRender);
  
  if (contentToRender && Array.isArray(contentToRender)) {
    contentToRender.forEach((block, index) => {
      console.log(`🔍 DEBUG - Block ${index} type: ${block._type}`, block);
      if (block._type === 'imageGallery') {
        console.log('🖼️ ¡¡¡ENCONTRADA GALERÍA imageGallery!!!:', block);
        console.log('🖼️ Images en la galería:', block.images);
        console.log('🖼️ Layout:', block.layout);
      }
    });
  } else {
    console.log('🚨 ERROR: contentToRender no es un array o está vacío');
  }

  // Componentes custom para PortableText
  const components = {
    types: {
      // 🖼️ IMAGEN SIMPLE
      image: ({ value }: any) => {
        if (!value?.asset?._ref && !value?.asset?._id && !value?.asset?.url) {
          return null;
        }
        
        return (
          <div style={{ position: 'relative', width: '100%', height: '400px', margin: '30px 0', borderRadius: '12px', overflow: 'hidden' }}>
            <Image
              src={urlFor(value)
                .width(800)
                .height(400)
                .format('webp')
                .quality(85)
                .fit('crop')
                .url()}
              alt={value.alt || 'Imagen del contenido'}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 800px"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            {value.caption && (
              <p className="image-caption">{value.caption}</p>
            )}
          </div>
        );
      },

      // 🖼️ GALERÍA DE IMÁGENES - UNIFICADA Y OPTIMIZADA
      imageGallery: ({ value }: any) => {
        if (!value?.images || value.images.length === 0) {
          return null;
        }
      
        const layout = value.layout || 'grid-2';
        
        return (
          <div className="image-gallery-container">
            {value.title && (
              <h3 className="gallery-title">{value.title}</h3>
            )}
            <div className={`gallery-grid gallery-${layout}`}>
              {value.images.map((image: any, index: number) => (
                <div key={index} className="gallery-item">
                  <div style={{ position: 'relative', width: '100%', height: '250px', borderRadius: '8px', overflow: 'hidden' }}>
                    <Image
                      src={urlFor(image)
                        .width(400)
                        .height(250)
                        .format('webp')
                        .quality(80)
                        .fit('crop')
                        .url()}
                      alt={image.alt || image.caption || `Gallery image ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 400px"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </div>
                  {image.caption && (
                    <p className="gallery-caption">{image.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      },

      // 🆕 IMAGEN CON TEXTO
      imageWithText: ({ value }: any) => {
        if (!value?.image) return null;

        const layout = value.layout || 'image-left';

        return (
          <div className={`image-text-container ${layout}`}>
            <div className="image-text-image">
              <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                <Image
                  src={urlFor(value.image)
                    .width(500)
                    .height(300)
                    .format('webp')
                    .quality(85)
                    .fit('crop')
                    .url()}
                  alt={value.image.alt || 'Imagen con texto'}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 500px"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="image-text-content">
              <PortableText value={value.text} />
            </div>
          </div>
        );
      },

      // 🆕 CALL TO ACTION BOX
      ctaBox: ({ value }: any) => {
        if (!value?.title || !value?.buttonText || !value?.buttonUrl) return null;

        const style = value.style || 'primary';

        return (
          <div className={`cta-box cta-${style}`}>
            <h3 className="cta-title">{value.title}</h3>
            {value.description && (
              <p className="cta-description">{value.description}</p>
            )}
            <a 
              href={value.buttonUrl} 
              className={`cta-button cta-button-${style}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {value.buttonText}
            </a>
          </div>
        );
      },

      // 🆕 TABLA SIMPLE
      simpleTable: ({ value }: any) => {
        if (!value?.rows || value.rows.length === 0) return null;

        return (
          <div className="table-container">
            {value.title && (
              <h3 className="table-title">{value.title}</h3>
            )}
            <table className="simple-table">
              <tbody>
                {value.rows.map((row: any, rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.cells && row.cells.map((cell: string, cellIndex: number) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      },
    },
    block: {
      h1: ({ children }: any) => {
        const id = generateSectionId(children);
        return <h2 id={id || undefined} className="content-h1">{children}</h2>;
      },
      h2: ({ children }: any) => {
        const id = generateSectionId(children);
        return <h3 id={id || undefined} className="content-h2">{children}</h3>;
      },
      h3: ({ children }: any) => {
        const id = generateSectionId(children);
        return <h4 id={id || undefined} className="content-h3">{children}</h4>;
      },
      h4: ({ children }: any) => {
        const id = generateSectionId(children);
        return <h5 id={id || undefined} className="content-h4">{children}</h5>;
      },
      
      // H2 CON ICONOS ORIGINALES
      'h2-details': ({ children }: any) => {
        const id = generateSectionId(children);
        return (
          <h3 id={id || undefined} className="icon-heading h2">
            <span className="icon-heading-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </span>
            <span className="icon-heading-text">{children}</span>
          </h3>
        );
      },
      'h2-highlights': ({ children }: any) => {
        const id = generateSectionId(children);
        return (
          <h3 id={id || undefined} className="icon-heading h2">
            <span className="icon-heading-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            </span>
            <span className="icon-heading-text">{children}</span>
          </h3>
        );
      },

      // H2 CLEAN
      'h2-details-clean': ({ children }: any) => {
        const id = generateSectionId(children);
        return (
          <h3 id={id || undefined} className="icon-heading-clean h2">
            <span className="icon-clean">📋</span>
            <span className="text-clean">{children}</span>
          </h3>
        );
      },
      'h2-highlights-clean': ({ children }: any) => {
        const id = generateSectionId(children);
        return (
          <h3 id={id || undefined} className="icon-heading-clean h2">
            <span className="icon-clean">🌟</span>
            <span className="text-clean">{children}</span>
          </h3>
        );
      },
      
      // ✅ PÁRRAFOS LIMPIOS SIN AUTOLINKER
      normal: ({ children }: any) => (
        <p className="content-paragraph">{children}</p>
      ),
    },
    // ✅ MARKS (negritas, cursivas, etc.) - AHORA FUNCIONARÁN
    marks: {
      strong: ({ children }: any) => <strong>{children}</strong>,
      em: ({ children }: any) => <em>{children}</em>,
      code: ({ children }: any) => (
        <code style={{
          backgroundColor: '#f4f4f4',
          padding: '2px 6px',
          borderRadius: '3px',
          fontFamily: 'monospace',
          fontSize: '0.9em',
          color: '#e91e63'
        }}>
          {children}
        </code>
      ),
      underline: ({ children }: any) => (
        <span style={{ textDecoration: 'underline' }}>{children}</span>
      ),
      'strike-through': ({ children }: any) => (
        <span style={{ textDecoration: 'line-through' }}>{children}</span>
      ),
      link: ({ children, value }: any) => {
        const target = value?.blank ? '_blank' : '_self';
        const rel = value?.blank ? 'noopener noreferrer' : undefined;
        return (
          <a 
            href={value?.href} 
            target={target}
            rel={rel}
            style={{ 
              color: '#e91e63', 
              textDecoration: 'underline',
              transition: 'color 0.2s ease'
            }}
          >
            {children}
          </a>
        );
      },
    },
  };

  return (
    <div className="sanity-container">
      <div className="sanity-content">
        {/* IMAGEN PRINCIPAL OPTIMIZADA */}
        {post.mainImage?.asset?.url && (
          <div style={{ position: 'relative', width: '100%', height: '400px', margin: '0 0 30px 0', borderRadius: '12px', overflow: 'hidden' }}>
            <Image
              src={urlFor(post.mainImage)
                .width(800)
                .height(400)
                .format('webp')
                .quality(90)
                .fit('crop')
                .url()}
              alt={post.mainImage.alt || post.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 800px"
              priority={true}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        )}

        {/* CONTENIDO LIMPIO */}
        {contentToRender && (
          <PortableText value={contentToRender} components={components} />
        )}
        
        {/* CSS OPTIMIZADO Y LIMPIO */}
        <style jsx>{`
          /* 🏗️ CONTENEDORES PRINCIPALES */
          .sanity-container {
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
          }
          
          .sanity-content {
            width: 100%;
            line-height: 1.6;
            color: #333;
          }
          
          /* 📝 PÁRRAFOS */
          .content-paragraph {
            margin-bottom: 1.2rem;
            line-height: 1.7;
            color: #4a4a4a;
            font-size: 1.1rem;
          }
          
          /* 🎨 HEADINGS */
          .content-h1, .content-h2, .content-h3, .content-h4 {
            margin: 1.5rem 0 1rem 0;
            color: #2c3e50;
            font-weight: 600;
          }
          
          .content-h1 { font-size: 2rem; }
          .content-h2 { font-size: 1.75rem; }
          .content-h3 { font-size: 1.5rem; }
          .content-h4 { font-size: 1.25rem; }
          
          /* 🔥 ICON HEADINGS */
          .icon-heading {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin: 2rem 0 1.5rem 0;
            padding: 1rem;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-left: 4px solid #8816c0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          
          .icon-heading-icon {
            flex-shrink: 0;
            color: #8816c0;
          }
          
          .icon-heading-text {
            font-weight: 600;
            color: #2c3e50;
          }
          
          /* 🧹 CLEAN HEADINGS */
          .icon-heading-clean {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 1.5rem 0 1rem 0;
            font-weight: 600;
            color: #2c3e50;
          }
          
          .icon-clean {
            font-size: 1.2em;
          }

          /* 🖼️ IMAGEN SIMPLE */
          .image-caption {
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #666;
            text-align: center;
            font-style: italic;
          }

          /* 🖼️ GALERÍA DE IMÁGENES */
          .image-gallery-container {
            margin: 2rem 0;
          }

          .gallery-title {
            margin-bottom: 1rem;
            color: #2c3e50;
            font-weight: 600;
          }

          .gallery-grid {
            display: grid;
            gap: 1.5rem;
          }

          .gallery-grid-2 {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          }

          .gallery-grid-3 {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }

          .gallery-carousel {
            display: flex;
            gap: 1rem;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 1rem;
          }

          .gallery-carousel .gallery-item {
            flex: 0 0 300px;
            scroll-snap-align: start;
          }

          .gallery-item {
            position: relative;
          }

          .gallery-caption {
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #666;
            text-align: center;
            font-style: italic;
          }

          /* 🆕 IMAGEN CON TEXTO */
          .image-text-container {
            display: grid;
            gap: 2rem;
            margin: 2rem 0;
            align-items: center;
          }

          .image-text-container.image-left {
            grid-template-columns: 1fr 1fr;
          }

          .image-text-container.text-left {
            grid-template-columns: 1fr 1fr;
          }

          .image-text-container.text-left .image-text-image {
            order: 2;
          }

          .image-text-container.text-left .image-text-content {
            order: 1;
          }

          /* 🆕 CTA BOX */
          .cta-box {
            margin: 2rem 0;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .cta-primary {
            background: linear-gradient(135deg, #e91e63 0%, #8e24aa 100%);
            color: white;
          }

          .cta-secondary {
            background: linear-gradient(135deg, #673ab7 0%, #3f51b5 100%);
            color: white;
          }

          .cta-outline {
            background: white;
            border: 2px solid #e91e63;
            color: #2c3e50;
          }

          .cta-title {
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
            font-weight: 600;
          }

          .cta-description {
            margin: 0 0 1.5rem 0;
            opacity: 0.9;
          }

          .cta-button {
            display: inline-block;
            padding: 0.75rem 2rem;
            borderRadius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
          }

          .cta-button-primary {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
          }

          .cta-button-primary:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
          }

          .cta-button-secondary {
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
          }

          .cta-button-secondary:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
          }

          .cta-button-outline {
            background: #e91e63;
            color: white;
            border: 2px solid #e91e63;
          }

          .cta-button-outline:hover {
            background: #ad1457;
            border-color: #ad1457;
            transform: translateY(-2px);
          }

          /* 🆕 TABLA */
          .table-container {
            margin: 2rem 0;
            overflow-x: auto;
          }

          .table-title {
            margin-bottom: 1rem;
            color: #2c3e50;
            font-weight: 600;
          }

          .simple-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .simple-table td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e9ecef;
            vertical-align: top;
          }

          .simple-table tr:first-child td {
            background: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
          }

          .simple-table tr:last-child td {
            border-bottom: none;
          }

          .simple-table tr:hover {
            background: #f8f9fa;
          }
          
          /* 📱 RESPONSIVE */
          @media (max-width: 768px) {
            .content-paragraph {
              font-size: 1rem;
            }
            
            .icon-heading {
              padding: 0.75rem;
              gap: 0.5rem;
            }
            
            .gallery-grid {
              grid-template-columns: 1fr;
            }

            .image-text-container {
              grid-template-columns: 1fr !important;
            }

            .image-text-container.text-left .image-text-image,
            .image-text-container.text-left .image-text-content {
              order: unset;
            }

            .cta-box {
              padding: 1.5rem;
            }

            .gallery-carousel .gallery-item {
              flex: 0 0 250px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}