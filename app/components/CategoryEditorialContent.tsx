'use client';

import { useState, useRef, useEffect } from 'react';
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
  // Estados: 'collapsed' | 'partial' | 'full'
  const [expandState, setExpandState] = useState<'collapsed' | 'partial' | 'full'>('collapsed');
  const contentRef = useRef<HTMLDivElement>(null);

  if (!content) return null;

  const vehicleType = getVehicleType(cityName);
  const defaultTitle = `Why You Should Take a ${vehicleType} Tour in ${cityName}`;

  const isPlainText = typeof content === 'string';
  const isBlockContent = Array.isArray(content) && content.length > 0;

  if (!isPlainText && !isBlockContent) return null;

  // MODO TEXTO PLANO (legacy)
  if (isPlainText) {
    const paragraphs = content.split('\n\n').filter((p: string) => p.trim());
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

        <div 
          ref={contentRef}
          style={{ 
            fontSize: '1rem', 
            lineHeight: '1.75', 
            color: '#444',
            maxHeight: expandState === 'collapsed' ? '120px' : expandState === 'partial' ? '400px' : 'none',
            overflow: 'hidden',
            transition: 'max-height 0.5s ease-in-out'
          }}
        >
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

        {hasMoreContent && expandState !== 'full' && (
          <button
            onClick={() => {
              if (expandState === 'collapsed') {
                setExpandState('partial');
              } else {
                setExpandState('full');
              }
            }}
            style={{
              marginTop: '8px',
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
            <span>Read more</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}

        {expandState !== 'collapsed' && (
          <button
            onClick={() => {
              setExpandState('collapsed');
              setTimeout(() => {
                contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            style={{
              marginTop: '8px',
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
            <span>Show less</span>
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
                transform: 'rotate(180deg)'
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </section>
    );
  }

  // MODO BLOCKCONTENT (nuevo) - Expansión progresiva
  const totalBlocks = content.length;
  
  let visibleContent;
  if (expandState === 'collapsed') {
    visibleContent = content.slice(0, 1); // 1 bloque
  } else if (expandState === 'partial') {
    visibleContent = content.slice(0, 4); // 4 bloques
  } else {
    visibleContent = content; // Todo
  }

  const hasMoreContent = totalBlocks > 1;

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

      <div 
        ref={contentRef}
        style={{ 
          fontSize: '1rem', 
          lineHeight: '1.75', 
          color: '#444',
          maxHeight: expandState === 'collapsed' ? '120px' : expandState === 'partial' ? '450px' : 'none',
          overflow: 'hidden',
          transition: 'max-height 0.5s ease-in-out'
        }}
      >
        <PortableText value={visibleContent} components={components} />
      </div>

      {hasMoreContent && expandState !== 'full' && (
        <button
          onClick={() => {
            if (expandState === 'collapsed') {
              setExpandState(totalBlocks <= 4 ? 'full' : 'partial');
            } else {
              setExpandState('full');
            }
          }}
          style={{
            marginTop: '8px',
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
          <span>Read more</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {expandState !== 'collapsed' && (
        <button
          onClick={() => {
            setExpandState('collapsed');
            setTimeout(() => {
              contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          style={{
            marginTop: '8px',
            marginLeft: '12px',
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
          <span>Show less</span>
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
              transform: 'rotate(180deg)'
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </section>
  );
}