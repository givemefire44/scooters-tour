'use client';

import { useState } from 'react';

interface CategoryEditorialContentProps {
  cityName: string;
  content: string;
  customTitle?: string;
}

// Función para convertir **texto** en negritas
function formatText(text: string) {
  // Convertir **texto** a <strong>texto</strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index} style={{ color: '#1a1a1a' }}>{boldText}</strong>;
    }
    return part;
  });
}

// Ciudades italianas usan "Vespa", resto usa "Scooter"
function getVehicleType(cityName: string): string {
  const italianCities = [
    // Principales
    'rome', 'roma', 
    'florence', 'firenze', 
    'naples', 'napoli', 
    'venice', 'venezia', 
    'milan', 'milano',
    
    // Toscana
    'tuscany', 'toscana',
    'chianti',
    'siena',
    'san gimignano',
    'lucca',
    'arezzo',
    'fiesole',
    'montepulciano',
    'montalcino',
    'cortona',
    'val d\'orcia',
    'mugello',
    'vinci',
    'pisa',
    
    // Costa Amalfitana
    'amalfi',
    'sorrento',
    'positano',
    'ravello',
    'praiano',
    'salerno',
    'capri',
    
    // Sicilia
    'sicily', 'sicilia',
    'palermo',
    'taormina',
    'cefalu', 'cefalù',
    'trapani',
    'catania',
    'siracusa', 'syracuse',
    'agrigento',
    
    // Cerdeña
    'sardinia', 'sardegna',
    'olbia',
    'cagliari',
    'alghero',
    
    // Norte
    'veneto',
    'treviso',
    'dolomites', 'dolomiti',
    'prosecco',
    'cinque terre',
    'portofino',
    'torino', 'turin',
    'genova', 'genoa',
    'como',
    'garda',
    'maggiore',
    'verona',
    'bologna',
    'trieste',
    'bergamo',
    'brescia',
    
    // Centro/Sur
    'puglia', 'apulia',
    'bari',
    'lecce',
    'matera',
    'perugia',
    'umbria',
    'assisi',
    'orvieto',
    'spoleto',
    'padova', 'padua',
    'rimini',
    'ravenna',
    'parma',
    'modena',
    'ferrara',
    'ancona',
    'marche',
    
    // Históricos
    'pompeii', 'pompei',
    'vesuvius', 'vesuvio',
    'herculaneum', 'ercolano'
  ];
  
  const cityLower = cityName.toLowerCase();
  
  // Verificar si el nombre de la ciudad contiene alguna ciudad italiana
  for (const italianCity of italianCities) {
    if (cityLower.includes(italianCity)) {
      return 'Vespa';
    }
  }
  
  return 'Scooter';
}

export default function CategoryEditorialContent({ 
  cityName, 
  content,
  customTitle
}: CategoryEditorialContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  // Dividir contenido en párrafos
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  // Preview: primeros 300 caracteres aproximadamente (3 líneas)
  const previewText = content.substring(0, 300);
  const lastSpace = previewText.lastIndexOf(' ');
  const cleanPreview = previewText.substring(0, lastSpace) + '...';
  const hasMoreContent = content.length > 300;

  // Título dinámico: Vespa para Italia, Scooter para el resto
  const vehicleType = getVehicleType(cityName);
  const defaultTitle = `Why You Should Take a ${vehicleType} Tour in ${cityName}`;

  return (
    <section 
      style={{
        marginBottom: '24px',
        width: '100%'
      }}
    >
      {/* Título */}
      <h2 style={{
        fontSize: '1.6rem',
        fontWeight: '700',
        marginBottom: '20px',
        color: '#1a1a1a',
        lineHeight: '1.3'
      }}>
        {customTitle || defaultTitle}
      </h2>

      {/* Contenido */}
      <div style={{
        fontSize: '1rem',
        lineHeight: '1.75',
        color: '#444'
      }}>
        {!isExpanded ? (
          // Vista colapsada - solo preview
          <p style={{ margin: 0 }}>
            {formatText(cleanPreview)}
          </p>
        ) : (
          // Vista expandida - todos los párrafos
          <div>
            {paragraphs.map((paragraph, index) => (
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

        {/* Botón minimalista tipo link */}
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