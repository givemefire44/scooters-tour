'use client';

import { useState } from 'react';
import { PortableText } from '@portabletext/react';

interface CategoryEditorialContentProps {
  cityName: string;
  content: any;
  customTitle?: string;
}

function getVehicleType(cityName: string): string {
  const italianCities = [
    'rome', 'roma', 'florence', 'firenze', 'naples', 'napoli', 
    'venice', 'venezia', 'milan', 'milano',
    'tuscany', 'toscana', 'chianti', 'siena', 'san gimignano',
    'lucca', 'arezzo', 'fiesole', 'montepulciano', 'montalcino',
    'cortona', 'val d\'orcia', 'mugello', 'vinci', 'pisa',
    'amalfi', 'sorrento', 'positano', 'ravello', 'praiano',
    'salerno', 'capri',
    'sicily', 'sicilia', 'palermo', 'taormina', 'cefalu', 'cefalù',
    'trapani', 'catania', 'siracusa', 'syracuse', 'agrigento',
    'sardinia', 'sardegna', 'olbia', 'cagliari', 'alghero',
    'veneto', 'treviso', 'dolomites', 'dolomiti', 'prosecco',
    'cinque terre', 'portofino', 'torino', 'turin', 'genova',
    'genoa', 'como', 'garda', 'maggiore', 'verona', 'bologna',
    'trieste', 'bergamo', 'brescia',
    'puglia', 'apulia', 'bari', 'lecce', 'matera', 'perugia',
    'umbria', 'assisi', 'orvieto', 'spoleto', 'padova', 'padua',
    'rimini', 'ravenna', 'parma', 'modena', 'ferrara', 'ancona',
    'marche',
    'pompeii', 'pompei', 'vesuvius', 'vesuvio', 'herculaneum', 'ercolano'
  ];
  
  const cityLower = cityName.toLowerCase();
  
  for (const italianCity of italianCities) {
    if (cityLower.includes(italianCity)) {
      return 'Vespa';
    }
  }
  
  return 'Scooter';
}

const components = {
  block: {
    h2: ({ children }: any) => (
      <h2 style={{
        fontSize: '1.4rem',
        fontWeight: '700',
        marginTop: '24px',
        marginBottom: '12px',
        color: '#1a1a1a',
        lineHeight: '1.3'
      }}>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 style={{
        fontSize: '1.2rem',
        fontWeight: '600',
        marginTop: '20px',
        marginBottom: '10px',
        color: '#333',
        lineHeight: '1.3'
      }}>
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p style={{
        marginBottom: '16px',
        lineHeight: '1.75',
        color: '#444'
      }}>
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul style={{
        marginBottom: '16px',
        paddingLeft: '24px',
        lineHeight: '1.75'
      }}>
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol style={{
        marginBottom: '16px',
        paddingLeft: '24px',
        lineHeight: '1.75'
      }}>
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li style={{ marginBottom: '8px', color: '#444' }}>{children}</li>
    ),
    number: ({ children }: any) => (
      <li style={{ marginBottom: '8px', color: '#444' }}>{children}</li>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong style={{ color: '#1a1a1a', fontWeight: '600' }}>{children}</strong>
    ),
    em: ({ children }: any) => <em>{children}</em>,
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        target={value.blank ? '_blank' : '_self'}
        rel={value.blank ? 'noopener noreferrer' : undefined}
        style={{ color: '#8816c0', textDecoration: 'underline' }}
      >
        {children}
      </a>
    ),
  },
};

// Función para convertir **texto** en negritas (para texto plano legacy)
function formatText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index} style={{ color: '#1a1a1a' }}>{boldText}</strong>;
    }
    return part;
  });
}

export default function CategoryEditorialContent({ 
  cityName, 
  content,
  customTitle
}: CategoryEditorialContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  const vehicleType = getVehicleType(cityName);
  const defaultTitle = `Why You Should Take a ${vehicleType} Tour in ${cityName}`;

  // 🔥 DETECTAR SI ES TEXTO PLANO O BLOCKCONTENT
  const isPlainText = typeof content === 'string';
  const isBlockContent = Array.isArray(content) && content.length > 0;

  if (!isPlainText && !isBlockContent) return null;

  // 📝 MODO TEXTO PLANO (legacy)
  if (isPlainText) {
    const paragraphs = content.split('\n\n').filter((p: string) => p.trim());
    const previewText = content.substring(0, 300);
    const lastSpace = previewText.lastIndexOf(' ');
    const cleanPreview = previewText.substring(0, lastSpace) + '...';
    const hasMoreContent = content.length > 300;

    return (
      <section style={{ marginBottom: '24px', width: '100%' }}>
        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#1a1a1a',
          lineHeight: '1.3'
        }}>
          {customTitle || defaultTitle}
        </h2>

        <div style={{ fontSize: '1rem', lineHeight: '1.75', color: '#444' }}>
          {!isExpanded ? (
            <p style={{ margin: 0 }}>
              {formatText(cleanPreview)}
            </p>
          ) : (
            <div>
              {paragraphs.map((paragraph: string, index: number) => (
                <p 
                  key={index} 
                  style={{
                    marginBottom: index < paragraphs.length - 1 ? '16px' : '0',
                    lineHeight: '1.75'
                  }}
                >
                  {formatText(paragraph)}
                </p>
              ))}
            </div>
          )}

          {hasMoreContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                marginTop: '16px',
                padding: '0',
                background: 'transparent',
                color: '#8816c0',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              <span>{isExpanded ? 'Show less' : 'Read more'}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>
      </section>
    );
  }

  // 🚀 MODO BLOCKCONTENT (nuevo)
  const hasMultipleBlocks = content.length > 3;
  const visibleContent = isExpanded ? content : content.slice(0, 3);

  return (
    <section style={{ marginBottom: '24px', width: '100%' }}>
      <h2 style={{
        fontSize: '1.6rem',
        fontWeight: '700',
        marginBottom: '20px',
        color: '#1a1a1a',
        lineHeight: '1.3'
      }}>
        {customTitle || defaultTitle}
      </h2>

      <div style={{ fontSize: '1rem', lineHeight: '1.75', color: '#444' }}>
        <PortableText value={visibleContent} components={components} />

        {hasMultipleBlocks && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              marginTop: '16px',
              padding: '0',
              background: 'transparent',
              color: '#8816c0',
              border: 'none',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            <span>{isExpanded ? 'Show less' : 'Read more'}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}