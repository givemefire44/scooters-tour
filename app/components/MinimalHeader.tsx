"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { client } from '@/sanity/lib/client';

interface Tour {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

interface MenuPage {
  title: string;
  slug: string;
  menuOrder?: number;
}

interface Destination {
  title: string;
  slug: string;
  country: string;
}

interface GroupedDestinations {
  [country: string]: Destination[];
}

const countryFlags: { [key: string]: string } = {
  'italy': '🇮🇹',
  'france': '🇫🇷',
  'usa': '🇺🇸',
  'spain': '🇪🇸',
  'germany': '🇩🇪',
  'portugal': '🇵🇹',
  'uk': '🇬🇧',
  'argentina': '🇦🇷',
  'brazil': '🇧🇷',
  'mexico': '🇲🇽'
};

const countryNames: { [key: string]: string } = {
  'italy': 'Italy',
  'france': 'France',
  'usa': 'United States',
  'spain': 'Spain',
  'germany': 'Germany',
  'portugal': 'Portugal',
  'uk': 'United Kingdom',
  'argentina': 'Argentina',
  'brazil': 'Brazil',
  'mexico': 'Mexico'
};

export default function MinimalHeader() {
  const [busqueda, setBusqueda] = useState("");
  const [busquedaMobile, setBusquedaMobile] = useState("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showResultsMobile, setShowResultsMobile] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [menuPages, setMenuPages] = useState<MenuPage[]>([]);
  const [destinations, setDestinations] = useState<GroupedDestinations>({});
  const [expandedCountries, setExpandedCountries] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchInputMobileRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchContainerMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    fetchMenuPages();
    fetchDestinations();
  }, []);

  const fetchMenuPages = async () => {
    try {
      const query = `
        *[_type == "page" && showInMenu == true] | order(menuOrder asc, title asc) {
          title,
          "slug": slug.current,
          menuOrder
        }
      `;
      const pages = await client.fetch(query);
      setMenuPages(pages);
    } catch (error) {
      console.error('Error fetching menu pages:', error);
      setMenuPages([]);
    }
  };

  const fetchDestinations = async () => {
    try {
      const query = `
        *[_type == "category" && defined(country)] | order(title asc) {
          "title": title,
          "slug": slug.current,
          country
        }
      `;
      const cats = await client.fetch(query);
      
      const grouped: GroupedDestinations = {};
      cats.forEach((cat: Destination) => {
        if (!grouped[cat.country]) {
          grouped[cat.country] = [];
        }
        grouped[cat.country].push(cat);
      });
      
      setDestinations(grouped);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setDestinations({});
    }
  };

  const toggleCountry = (country: string) => {
    setExpandedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const searchTours = async (query: string) => {
    if (query.length < 2) {
      setTours([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.tours && data.tours.length > 0) {
        const formattedTours = data.tours.slice(0, 3).map((tour: any) => ({
          id: tour._id,
          name: tour.title,
          slug: tour.slug,
          description: tour.seoDescription || '',
          duration: tour.tourInfo?.duration || '',
          price: tour.tourInfo?.price || 0,
          currency: tour.tourInfo?.currency || 'USD',
          rating: tour.getYourGuideData?.rating || 0,
          reviewCount: tour.getYourGuideData?.reviewCount || 0,
          imageUrl: tour.heroGallery?.[0]?.asset?.url || tour.mainImage?.asset?.url || ''
        }));
        setTours(formattedTours);
      } else {
        setTours([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBusqueda(value);
    setHovered(null);
    setShowResults(true);
    
    const timeoutId = setTimeout(() => {
      searchTours(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSearchInputMobile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBusquedaMobile(value);
    setHovered(null);
    setShowResultsMobile(true);
    
    const timeoutId = setTimeout(() => {
      searchTours(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const goToTour = (slug: string) => {
    window.location.href = `/${slug}`;
  };

  const goToSearch = (query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent, isMobile: boolean = false) => {
    const currentQuery = isMobile ? busquedaMobile : busqueda;
    if (e.key === "Enter") {
      e.preventDefault();
      if (hovered !== null && tours[hovered]) {
        goToTour(tours[hovered].slug);
        return;
      }
      if (currentQuery.trim()) {
        goToSearch(currentQuery);
      }
      return;
    }
    if (!tours.length) return;
    if (e.key === "ArrowDown")
      setHovered(h => h === null ? 0 : Math.min(tours.length - 1, h! + 1));
    if (e.key === "ArrowUp")
      setHovered(h => h === null ? tours.length - 1 : Math.max(0, h! - 1));
    if (e.key === "Escape") {
      setShowResults(false);
      setShowResultsMobile(false);
      setHovered(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      goToSearch(busqueda);
    }
  };

  const handleSearchMobile = (e: React.FormEvent) => {
    e.preventDefault();
    if (busquedaMobile.trim()) {
      goToSearch(busquedaMobile);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.dropdown-container')) {
        setLanguageDropdownOpen(false);
        setMenuDropdownOpen(false);
        setExpandedCountries([]);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (searchContainerMobileRef.current && !searchContainerMobileRef.current.contains(event.target as Node)) {
        setShowResultsMobile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ScootersTour.com',
        text: "Look what I found - best Scooters Tour! 🛵",
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const cleanCityName = (title: string) => {
    return title.split(' Vespa Tours')[0].split(' Tours')[0];
  };

  const getOrderedPages = () => {
    const order = ['about-us', 'terms-and-conditions', 'privacy-policy', 'contact'];
    return order
      .map(slug => menuPages.find(p => p.slug === slug))
      .filter(Boolean) as MenuPage[];
  };

  if (!isClient) {
    return <div style={{ height: '70px', width: '100%' }}></div>;
  }

  // Componente para el dropdown del menú
  const MenuDropdownContent = () => (
    <>
      {/* DESTINATIONS - ARRIBA */}
      {Object.keys(destinations).length > 0 && (
        <div style={{ padding: '12px 0' }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: '700', 
            color: '#8816c0', 
            marginBottom: '8px',
            padding: '0 16px',
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>🌍</span> Destinations
          </div>
          
          {Object.entries(destinations).map(([country, cities]) => (
            <div key={country}>
              <button
                onClick={() => toggleCountry(country)}
                style={{ 
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: expandedCountries.includes(country) ? '#f8f5ff' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8f5ff'}
                onMouseOut={(e) => e.currentTarget.style.background = expandedCountries.includes(country) ? '#f8f5ff' : 'transparent'}
              >
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{countryFlags[country] || '🏳️'}</span>
                  <span>{countryNames[country] || country}</span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#999',
                    fontWeight: '400'
                  }}>
                    ({cities.length})
                  </span>
                </span>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#666" 
                  strokeWidth="2"
                  style={{
                    transform: expandedCountries.includes(country) ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              
              {expandedCountries.includes(country) && (
                <div style={{ 
                  padding: '8px 16px 12px 40px',
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '6px',
                  background: '#f8f5ff'
                }}>
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/${city.slug}`}
                      onClick={() => {
                        setMenuDropdownOpen(false);
                        setExpandedCountries([]);
                      }}
                      style={{
                        fontSize: '13px',
                        color: '#555',
                        textDecoration: 'none',
                        padding: '5px 12px',
                        background: 'white',
                        borderRadius: '15px',
                        border: '1px solid #e8e0f0',
                        transition: 'all 0.15s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#8816c0';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = '#8816c0';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#555';
                        e.currentTarget.style.borderColor = '#e8e0f0';
                      }}
                    >
                      {cleanCityName(city.title)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ height: '1px', background: '#e0e0e0' }}></div>
      
      {/* PAGES - ABAJO */}
      <div style={{ padding: '12px 0' }}>
        <div style={{ 
          fontSize: '11px', 
          fontWeight: '700', 
          color: '#8816c0', 
          marginBottom: '4px',
          padding: '0 16px',
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>📄</span> Pages
        </div>
        
        <Link 
          href="/"
          style={{ 
            display: 'block', 
            padding: '10px 16px', 
            textDecoration: 'none', 
            color: '#444', 
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.15s'
          }}
          onClick={() => {
            setMenuDropdownOpen(false);
            setExpandedCountries([]);
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#f8f5ff';
            e.currentTarget.style.color = '#8816c0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#444';
          }}
        >
          Home
        </Link>

        {getOrderedPages().map((page) => (
          <Link 
            key={page.slug}
            href={`/${page.slug}`}
            style={{ 
              display: 'block', 
              padding: '10px 16px', 
              textDecoration: 'none', 
              color: '#444', 
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.15s'
            }}
            onClick={() => {
              setMenuDropdownOpen(false);
              setExpandedCountries([]);
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f8f5ff';
              e.currentTarget.style.color = '#8816c0';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#444';
            }}
          >
            {page.title}
          </Link>
        ))}
      </div>
    </>
  );

  // Componente de resultados de búsqueda reutilizable
  const SearchResults = ({ query, isMobile = false }: { query: string, isMobile?: boolean }) => (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      marginTop: '8px',
      zIndex: 2000,
      overflow: 'hidden',
      maxHeight: isMobile ? '60vh' : '400px',
      overflowY: 'auto'
    }}>
      {loading && (
        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
          🔄 Searching...
        </div>
      )}
      
      {!loading && tours.length === 0 && query.length >= 2 && (
        <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
          🔍 No tours found
        </div>
      )}
      
      {!loading && tours.length > 0 && (
        <>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Destinations
            </div>
            <div
              onClick={() => goToSearch(query)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 4px',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.15s'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                📍
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  {query.charAt(0).toUpperCase() + query.slice(1)}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Destination
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 16px 8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Top Tours
            </div>
          </div>
          
          {tours.map((tour, i) => {
            const isActive = hovered === i;
            return (
              <div
                key={tour.id}
                onClick={() => goToTour(tour.slug)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#f8f9fa' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background 0.15s'
                }}
              >
                {tour.imageUrl ? (
                  <img 
                    src={tour.imageUrl} 
                    alt={tour.name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem'
                  }}>
                    🛵
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '2px', 
                    color: '#333',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {tour.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#e91e63', fontWeight: '600' }}>
                      ${tour.price}
                    </span>
                    {tour.duration && <span>{tour.duration}</span>}
                    {tour.rating > 0 && (
                      <span>⭐ {tour.rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div
            onClick={() => goToSearch(query)}
            style={{
              padding: '14px 16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #e0e0e0',
              background: '#fafafa',
              transition: 'background 0.15s'
            }}
          >
            <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>
              See all results for "{query}"
            </span>
            <span style={{ fontSize: '18px', color: '#8816c0' }}>→</span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* HEADER DESKTOP */}
      <header className="header-desktop" style={{
        height: '70px',
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        zIndex: 1000,
        width: '100%',
        position: 'sticky',
        top: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          gap: '20px'
        }}>
          
          {/* LOGO DESKTOP */}
          <Link href="/" style={{
            fontSize: 'clamp(14px, 4vw, 18px)',
            fontWeight: '700',
            color: '#8816c0',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            ScootersTour.com 🛵
          </Link>

          {/* BARRA DE BÚSQUEDA - DESKTOP */}
          <div 
            ref={searchContainerRef}
            style={{
              flex: 1,
              maxWidth: '500px',
              position: 'relative'
            }}
          >
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #e0e0e0',
                borderRadius: '28px',
                overflow: 'hidden',
                background: '#fff',
                transition: 'border-color 0.2s'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  padding: '0 16px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ marginRight: '10px', flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search tours, cities..."
                    value={busqueda}
                    onChange={handleSearchInput}
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    onFocus={() => busqueda.length >= 2 && setShowResults(true)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      flex: 1,
                      fontSize: '15px',
                      padding: '12px 0',
                      color: '#333'
                    }}
                  />
                  {busqueda && (
                    <button
                      type="button"
                      onClick={() => {
                        setBusqueda("");
                        setTours([]);
                        setShowResults(false);
                        searchInputRef.current?.focus();
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20">
                        <line x1="5" y1="5" x2="15" y2="15" stroke="#999" strokeWidth="2"/>
                        <line x1="15" y1="5" x2="5" y2="15" stroke="#999" strokeWidth="2"/>
                      </svg>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#8816c0',
                    border: 'none',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '14px',
                    borderRadius: '0 26px 26px 0',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#7013a8'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#8816c0'}
                >
                  Search
                </button>
              </div>
            </form>

            {showResults && (busqueda.length >= 2 || tours.length > 0) && (
              <SearchResults query={busqueda} />
            )}
          </div>

          {/* ACCIONES - DESKTOP */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0
          }}>
            
            {/* IDIOMAS */}
            <div className="dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                style={{
                  background: 'transparent',
                  border: '1px solid #e0e0e0',
                  borderRadius: '20px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '13px'
                }}
              >
                <span>🌐</span>
                <span>EN</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
              
              {languageDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  padding: '8px 0',
                  minWidth: '120px',
                  zIndex: 1001
                }}>
                  <button style={{ width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
                    🇪🇸 Español
                  </button>
                  <button style={{ width: '100%', padding: '8px 16px', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}>
                    🇺🇸 English
                  </button>
                </div>
              )}
            </div>

            {/* COMPARTIR */}
            <button
              onClick={handleShare}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>

            {/* MENÚ HAMBURGER - DESKTOP */}
            <div className="dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setMenuDropdownOpen(!menuDropdownOpen);
                  if (menuDropdownOpen) setExpandedCountries([]);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              
              {menuDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  minWidth: '280px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  zIndex: 9999
                }}>
                  <MenuDropdownContent />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HEADER MOBILE */}
      <header className="header-mobile" style={{
        height: '56px',
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        zIndex: 1000,
        width: '100%',
        position: 'sticky',
        top: 0,
        display: 'none',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          height: '100%',
          gap: '8px',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          
          {/* LOGO MOBILE - 2 líneas */}
          <Link href="/" style={{
            textDecoration: 'none',
            flexShrink: 0,
            lineHeight: '1.1'
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#8816c0'
            }}>
              Scooters
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#8816c0'
            }}>
              Tour.com 🛵
            </div>
          </Link>

          {/* BARRA DE BÚSQUEDA - MOBILE */}
          <div 
            ref={searchContainerMobileRef}
            style={{
              flex: 1,
              position: 'relative',
              minWidth: 0,
              maxWidth: '100%'
            }}
          >
            <form onSubmit={handleSearchMobile} style={{ width: '100%' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1.5px solid #e0e0e0',
                borderRadius: '20px',
                background: '#f8f8f8',
                padding: '0 10px',
                height: '36px'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="M21 21l-4.35-4.35"></path>
                </svg>
                <input
                  ref={searchInputMobileRef}
                  type="text"
                  placeholder="Search..."
                  value={busquedaMobile}
                  onChange={handleSearchInputMobile}
                  onKeyDown={(e) => handleKeyDown(e, true)}
                  onFocus={() => busquedaMobile.length >= 2 && setShowResultsMobile(true)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    flex: 1,
                    fontSize: '13px',
                    padding: '6px 8px',
                    color: '#333',
                    minWidth: 0,
                    width: '100%'
                  }}
                />
                {busquedaMobile && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusquedaMobile("");
                      setTours([]);
                      setShowResultsMobile(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px",
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 20 20">
                      <line x1="5" y1="5" x2="15" y2="15" stroke="#999" strokeWidth="2"/>
                      <line x1="15" y1="5" x2="5" y2="15" stroke="#999" strokeWidth="2"/>
                    </svg>
                  </button>
                )}
              </div>
            </form>

            {showResultsMobile && (busquedaMobile.length >= 2 || tours.length > 0) && (
              <SearchResults query={busquedaMobile} isMobile={true} />
            )}
          </div>

          {/* COMPARTIR - MOBILE */}
          <button
            onClick={handleShare}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              flexShrink: 0
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>

          {/* MENÚ - MOBILE */}
          <div className="dropdown-container" style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => {
                setMenuDropdownOpen(!menuDropdownOpen);
                if (menuDropdownOpen) setExpandedCountries([]);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            
            {menuDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '-8px',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                minWidth: '280px',
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 9999
              }}>
                {/* IDIOMAS - MOBILE */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '6px 12px', border: '1px solid #e0e0e0', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '13px' }}>
                      🇪🇸 ES
                    </button>
                    <button style={{ padding: '6px 12px', border: '1px solid #8816c0', borderRadius: '6px', background: '#8816c0', color: 'white', cursor: 'pointer', fontSize: '13px' }}>
                      🇺🇸 EN
                    </button>
                  </div>
                </div>
                
                <MenuDropdownContent />
                
                {/* COMPARTIR - MOBILE MENU */}
                <div style={{ borderTop: '1px solid #e0e0e0' }}>
                  <button
                    onClick={() => {
                      handleShare();
                      setMenuDropdownOpen(false);
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: 'none', 
                      background: 'transparent', 
                      textAlign: 'left', 
                      cursor: 'pointer', 
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Share Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <style jsx>{`
        @media (max-width: 768px) {
          .header-desktop {
            display: none !important;
          }
          .header-mobile {
            display: block !important;
          }
        }
        
        @media (min-width: 769px) {
          .header-desktop {
            display: block !important;
          }
          .header-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}