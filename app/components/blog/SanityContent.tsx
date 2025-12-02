'use client'
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';
import { useState } from 'react';

// 📝 Secciones que se colapsan automáticamente
const COLLAPSIBLE_SECTIONS = [
  'What Makes This Tour Special',
  'The Experience: What to Expect',
  'Highlights & Hidden Gems',
  'What Makes This Experience Special',
  'The Experience',
  'Why We Love This Tour',
];

// 🔄 Componente de sección colapsable
function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const shouldCollapse = COLLAPSIBLE_SECTIONS.some(section => 
    title.toLowerCase().includes(section.toLowerCase())
  );
  
  if (!shouldCollapse) {
    return <>{children}</>;
  }
  
  return (
    <div className="collapsible-section">
      <div className={`collapsible-content ${isOpen ? 'open' : 'closed'}`}>
        {children}
      </div>
      <button 
        className="see-more-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {isOpen ? 'Show less' : 'See more'}
      </button>
      
      <style jsx>{`
        .collapsible-section {
          position: relative;
          margin-bottom: 1.5rem;
        }
        
        .collapsible-content {
          position: relative;
          overflow: hidden;
          transition: max-height 0.4s ease, opacity 0.3s ease;
        }
        
        .collapsible-content.closed {
          max-height: 140px;
        }
        
        .collapsible-content.closed::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
          pointer-events: none;
        }
        
        .collapsible-content.open {
          max-height: 5000px;
        }
        
        .see-more-btn {
          background: none;
          border: none;
          color: #5f6368;
          font-size: 14px;
          text-decoration: underline;
          cursor: pointer;
          padding: 8px 0;
          margin-top: 8px;
          transition: color 0.2s ease;
        }
        
        .see-more-btn:hover {
          color: #e91e63;
        }
      `}</style>
    </div>
  );
}

// Función para generar IDs
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
    content?: any;
  };
}

export default function SanityContent({ post }: SanityContentProps) {
  const contentToRender = post.content || post.body;
  
  // 🔄 Agrupar contenido por secciones H2
  const groupedContent = () => {
    if (!contentToRender || !Array.isArray(contentToRender)) return [];
    
    const sections: any[] = [];
    let currentSectionBlocks: any[] = [];
    let currentH2: any = null;
    
    contentToRender.forEach((block) => {
      if (block.style === 'h3' || block._type === 'h3') {
        if (currentH2) {
          sections.push({
            type: 'section',
            heading: currentH2,
            blocks: currentSectionBlocks
          });
        }
        currentH2 = block;
        currentSectionBlocks = [];
      } else {
        if (currentH2) {
          currentSectionBlocks.push(block);
        } else {
          sections.push({ type: 'standalone', block });
        }
      }
    });
    
    if (currentH2) {
      sections.push({
        type: 'section',
        heading: currentH2,
        blocks: currentSectionBlocks
      });
    }
    
    return sections;
  };

  const components = {
    types: {
      image: ({ value }: any) => {
        if (!value?.asset?._ref && !value?.asset?._id && !value?.asset?.url) return null;
        
        return (
          <div style={{ position: 'relative', width: '100%', height: '400px', margin: '30px 0', borderRadius: '12px', overflow: 'hidden' }}>
            <Image
              src={urlFor(value).width(800).height(400).format('webp').quality(85).fit('crop').url()}
              alt={value.alt || 'Imagen del contenido'}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 800px"
              loading="lazy"
            />
            {value.caption && <p className="image-caption">{value.caption}</p>}
          </div>
        );
      },
      
      imageGallery: ({ value }: any) => {
        if (!value?.images || value.images.length === 0) return null;
        const layout = value.layout || 'grid-2';
        
        return (
          <div className="image-gallery-container">
            {value.title && <h3 className="gallery-title">{value.title}</h3>}
            <div className={`gallery-grid gallery-${layout}`}>
              {value.images.map((image: any, index: number) => (
                <div key={index} className="gallery-item">
                  <div style={{ position: 'relative', width: '100%', height: '250px', borderRadius: '8px', overflow: 'hidden' }}>
                    <Image
                      src={urlFor(image).width(400).height(250).format('webp').quality(80).fit('crop').url()}
                      alt={image.alt || image.caption || `Gallery image ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 400px"
                      loading="lazy"
                    />
                  </div>
                  {image.caption && <p className="gallery-caption">{image.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      },
      
      imageWithText: ({ value }: any) => {
        if (!value?.image) return null;
        const layout = value.layout || 'image-left';
        
        return (
          <div className={`image-text-container ${layout}`}>
            <div className="image-text-image">
              <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                <Image
                  src={urlFor(value.image).width(500).height(300).format('webp').quality(85).fit('crop').url()}
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
      
      ctaBox: ({ value }: any) => {
        if (!value?.title || !value?.buttonText || !value?.buttonUrl) return null;
        const style = value.style || 'primary';
        
        return (
          <div className={`cta-box cta-${style}`}>
            <h3 className="cta-title">{value.title}</h3>
            {value.description && <p className="cta-description">{value.description}</p>}
            <a href={value.buttonUrl} className={`cta-button cta-button-${style}`} target="_blank" rel="noopener noreferrer">
              {value.buttonText}
            </a>
          </div>
        );
      },
      
      simpleTable: ({ value }: any) => {
        if (!value?.rows || value.rows.length === 0) return null;
        
        return (
          <div className="table-container">
            {value.title && <h3 className="table-title">{value.title}</h3>}
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
      
      normal: ({ children }: any) => <p className="content-paragraph">{children}</p>,
    },
    marks: {
      strong: ({ children }: any) => <strong>{children}</strong>,
      em: ({ children }: any) => <em>{children}</em>,
      code: ({ children }: any) => (
        <code style={{ backgroundColor: '#f4f4f4', padding: '2px 6px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '0.9em', color: '#e91e63' }}>
          {children}
        </code>
      ),
      underline: ({ children }: any) => <span style={{ textDecoration: 'underline' }}>{children}</span>,
      'strike-through': ({ children }: any) => <span style={{ textDecoration: 'line-through' }}>{children}</span>,
      link: ({ children, value }: any) => {
        const target = value?.blank ? '_blank' : '_self';
        const rel = value?.blank ? 'noopener noreferrer' : undefined;
        return (
          <a href={value?.href} target={target} rel={rel} style={{ color: '#e91e63', textDecoration: 'underline', transition: 'color 0.2s ease' }}>
            {children}
          </a>
        );
      },
    },
  };

  const sections = groupedContent();

  return (
    <div className="sanity-container">
      <div className="sanity-content">
        {post.mainImage?.asset?.url && (
          <div style={{ position: 'relative', width: '100%', height: '400px', margin: '0 0 30px 0', borderRadius: '12px', overflow: 'hidden' }}>
            <Image
              src={urlFor(post.mainImage).width(800).height(400).format('webp').quality(90).fit('crop').url()}
              alt={post.mainImage.alt || post.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 800px"
              priority={true}
            />
          </div>
        )}

        {sections.map((section, index) => {
          if (section.type === 'standalone') {
            return <PortableText key={index} value={[section.block]} components={components} />;
          }
          
          if (section.type === 'section') {
            const headingText = section.heading.children?.[0]?.text || '';
            
            return (
              <div key={index}>
                <PortableText value={[section.heading]} components={components} />
                <CollapsibleSection title={headingText}>
                  <PortableText value={section.blocks} components={components} />
                </CollapsibleSection>
              </div>
            );
          }
          
          return null;
        })}
        
        <style jsx>{`
          .sanity-container { max-width: 100%; margin: 0 auto; padding: 0; }
          .sanity-content { width: 100%; line-height: 1.6; color: #333; }
          .content-paragraph { margin-bottom: 1.2rem; line-height: 1.7; color: #4a4a4a; font-size: 1.1rem; }
          .content-h1, .content-h2, .content-h3, .content-h4 { margin: 1.5rem 0 1rem 0; color: #2c3e50; font-weight: 600; }
          .content-h1 { font-size: 2rem; }
          .content-h2 { font-size: 1.75rem; }
          .content-h3 { font-size: 1.5rem; }
          .content-h4 { font-size: 1.25rem; }
          
          .image-caption, .gallery-caption { margin-top: 0.5rem; font-size: 0.9rem; color: #666; text-align: center; font-style: italic; }
          
          .image-gallery-container { margin: 2rem 0; }
          .gallery-title { margin-bottom: 1rem; color: #2c3e50; font-weight: 600; }
          .gallery-grid { display: grid; gap: 1.5rem; }
          .gallery-grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
          .gallery-grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
          
          .image-text-container { display: grid; gap: 2rem; margin: 2rem 0; align-items: center; }
          .image-text-container.image-left { grid-template-columns: 1fr 1fr; }
          .image-text-container.text-left { grid-template-columns: 1fr 1fr; }
          .image-text-container.text-left .image-text-image { order: 2; }
          .image-text-container.text-left .image-text-content { order: 1; }
          
          .cta-box { margin: 2rem 0; padding: 2rem; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .cta-primary { background: linear-gradient(135deg, #e91e63 0%, #8e24aa 100%); color: white; }
          .cta-secondary { background: linear-gradient(135deg, #673ab7 0%, #3f51b5 100%); color: white; }
          .cta-outline { background: white; border: 2px solid #e91e63; color: #2c3e50; }
          .cta-title { margin: 0 0 1rem 0; font-size: 1.5rem; font-weight: 600; }
          .cta-description { margin: 0 0 1.5rem 0; opacity: 0.9; }
          .cta-button { display: inline-block; padding: 0.75rem 2rem; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s ease; }
          .cta-button-primary { background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); }
          .cta-button-primary:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
          
          .table-container { margin: 2rem 0; overflow-x: auto; }
          .table-title { margin-bottom: 1rem; color: #2c3e50; font-weight: 600; }
          .simple-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .simple-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e9ecef; vertical-align: top; }
          .simple-table tr:first-child td { background: #f8f9fa; font-weight: 600; color: #2c3e50; }
          .simple-table tr:last-child td { border-bottom: none; }
          .simple-table tr:hover { background: #f8f9fa; }
          
          @media (max-width: 768px) {
            .content-paragraph { font-size: 1rem; }
            .gallery-grid { grid-template-columns: 1fr; }
            .image-text-container { grid-template-columns: 1fr !important; }
            .image-text-container.text-left .image-text-image,
            .image-text-container.text-left .image-text-content { order: unset; }
            .cta-box { padding: 1.5rem; }
          }
        `}</style>
      </div>
    </div>
  );
}