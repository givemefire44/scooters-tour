'use client'

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={className}
      style={{
        margin: '0.8rem 0 1.5rem 0',
        fontSize: '0.9rem'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#22c55e', // Verde similar al de la imagen
        fontWeight: '500'
      }}>
        {/* Icono de navegación */}
        <span style={{ fontSize: '1rem' }}>🧭</span>
        
        <ol style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          listStyle: 'none',
          margin: 0,
          padding: 0
        }}>
          {items.map((item, index) => (
            <li key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {/* Separador */}
              {index > 0 && (
                <span style={{
                  color: '#22c55e',
                  fontSize: '0.8rem',
                  opacity: 0.7
                }}>
                  →
                </span>
              )}
              
              {/* Link o texto activo */}
              {item.href && !item.isActive ? (
                <Link 
                  href={item.href}
                  className="breadcrumb-link"
                  style={{
                    color: '#22c55e',
                    textDecoration: 'none',
                    opacity: 0.8,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span style={{
                  color: '#22c55e',
                  fontWeight: item.isActive ? '600' : '500',
                  opacity: item.isActive ? 1 : 0.8
                }}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      
      {/* Structured Data para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              ...(item.href && { "item": `https://colosseumroman.com${item.href}` })
            }))
          })
        }}
      />
      {/* CSS para hover */}
      <style jsx>{`
        .breadcrumb-link:hover {
          opacity: 1 !important;
        }
      `}</style>
    </nav>
  )
}