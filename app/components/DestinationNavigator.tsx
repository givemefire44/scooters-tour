'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  title: string;
  slug: string;
}

interface DestinationNavigatorProps {
  allDestinations: Category[];
}

export default function DestinationNavigator({
  allDestinations
}: DestinationNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = allDestinations.filter(dest =>
      dest.title.toLowerCase().includes(query)
    ).slice(0, 8); // Máximo 8 resultados

    setSearchResults(results);
    setShowResults(true);
  }, [searchQuery, allDestinations]);

  // Limpiar título (quitar texto después de ":")
  const cleanTitle = (title: string) => {
    return title.includes(':') ? title.split(':')[0].trim() : title;
  };

  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      {/* HOME LINK */}
      <Link 
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          textDecoration: 'none',
          color: '#333',
          fontWeight: '600',
          fontSize: '0.95rem',
          marginBottom: '20px',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#e9ecef'}
        onMouseOut={(e) => e.currentTarget.style.background = '#f8f9fa'}
      >
        <span style={{ fontSize: '1.2rem' }}>🏠</span>
        <span>Home</span>
      </Link>

      {/* SEARCH */}
      <div style={{ position: 'relative' }}>
        <h4 style={{
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '10px',
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          🔍 Find Your Destination
        </h4>
        
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Type city name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border 0.2s ease'
            }}
            onFocusCapture={(e) => e.currentTarget.style.borderColor = '#22c55e'}
            onBlurCapture={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
          />
          
          <span style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.2rem',
            pointerEvents: 'none'
          }}>
            🔎
          </span>
        </div>

        {/* SEARCH RESULTS DROPDOWN */}
        {showResults && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            background: 'white',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '320px',
            overflowY: 'auto'
          }}>
            {searchResults.map((dest) => (
              <Link
                key={dest.slug}
                href={`/${dest.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  textDecoration: 'none',
                  color: '#333',
                  fontSize: '0.9rem',
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '1rem' }}>📍</span>
                <span>{cleanTitle(dest.title)}</span>
              </Link>
            ))}
          </div>
        )}

        {/* NO RESULTS */}
        {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            background: 'white',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '0.85rem',
            color: '#666',
            textAlign: 'center'
          }}>
            No destinations found
          </div>
        )}
      </div>
    </div>
  );
}