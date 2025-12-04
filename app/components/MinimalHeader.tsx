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
  slug: {
    current: string;
  };
  menuOrder?: number;
}

export default function MinimalHeader() {
  const [busqueda, setBusqueda] = useState("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [menuPages, setMenuPages] = useState<MenuPage[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    fetchMenuPages();
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

  // NAVEGACIÓN DIRECTA - Sin setBusqueda ni setShowResults
  const goToTour = (slug: string) => {
    window.location.href = `/${slug}`;
  };

  const goToSearch = (query: string) => {
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (hovered !== null && tours[hovered]) {
        goToTour(tours[hovered].slug);
        return;
      }
      if (busqueda.trim()) {
        goToSearch(busqueda);
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
      setHovered(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      goToSearch(busqueda);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.dropdown-container')) {
        setLanguageDropdownOpen(false);
        setMenuDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
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

  if (!isClient) {
    return <div style={{ height: '70px', width: '100%' }}></div>;
  }

  return (
    <>
      <header style={{
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
          
          {/* LOGO */}
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
            className="search-desktop"
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
                    onKeyDown={handleKeyDown}
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

            {/* DROPDOWN DE RESULTADOS */}
            {showResults && (busqueda.length >= 2 || tours.length > 0) && (
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
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {loading && (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                    🔄 Searching...
                  </div>
                )}
                
                {!loading && tours.length === 0 && busqueda.length >= 2 && (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                    🔍 No tours found
                  </div>
                )}
                
                {!loading && tours.length > 0 && (
                  <>
                    {/* DESTINATIONS - Click navega directo */}
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Destinations
                      </div>
                      <div
                        onClick={() => goToSearch(busqueda)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 4px',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          transition: 'background 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
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
                            {busqueda.charAt(0).toUpperCase() + busqueda.slice(1)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#888' }}>
                            Destination
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TOP TOURS */}
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

                    {/* SEE ALL RESULTS - Click navega directo */}
                    <div
                      onClick={() => goToSearch(busqueda)}
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
                      onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#fafafa'}
                    >
                      <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>
                        See all results for "{busqueda}"
                      </span>
                      <span style={{ fontSize: '18px', color: '#8816c0' }}>→</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ACCIONES - DESKTOP */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0
          }}
          className="desktop-actions"
          >
            
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

            {/* MENÚ HAMBURGER */}
            <div className="dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuDropdownOpen(!menuDropdownOpen)}
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
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  padding: '8px 0',
                  minWidth: '160px',
                  zIndex: 9999
                }}>
                  {menuPages.map((page) => (
                    <Link 
                      key={page.slug.current}
                      href={`/${page.slug}`}
                      style={{ 
                        display: 'block', 
                        padding: '8px 16px', 
                        textDecoration: 'none', 
                        color: '#333', 
                        fontSize: '14px' 
                      }}
                      onClick={() => setMenuDropdownOpen(false)}
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ACCIONES - MOBILE */}
          <div style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px' 
          }}
          className="mobile-actions"
          >
            <button
              onClick={handleShare}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
            <div className="dropdown-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuDropdownOpen(!menuDropdownOpen)}
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
                  right: '-10px',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  padding: '8px 0',
                  minWidth: '200px',
                  zIndex: 9999
                }}>
                  {/* IDIOMAS */}
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: '4px', background: 'transparent', cursor: 'pointer', fontSize: '12px' }}>
                        🇪🇸 ES
                      </button>
                      <button style={{ padding: '4px 8px', border: '1px solid #8816c0', borderRadius: '4px', background: '#8816c0', color: 'white', cursor: 'pointer', fontSize: '12px' }}>
                        🇺🇸 EN
                      </button>
                    </div>
                  </div>
                  
                  {/* COMPARTIR */}
                  <button
                    onClick={() => {
                      handleShare();
                      setMenuDropdownOpen(false);
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '8px 16px', 
                      border: 'none', 
                      background: 'transparent', 
                      textAlign: 'left', 
                      cursor: 'pointer', 
                      fontSize: '14px',
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
                  
                  <div style={{ height: '1px', background: '#f0f0f0', margin: '8px 0' }}></div>
                  
                  {menuPages.map((page) => (
                    <Link 
                      key={page.slug.current}
                      href={`/${page.slug}`}
                      style={{ 
                        display: 'block', 
                        padding: '8px 16px', 
                        textDecoration: 'none', 
                        color: '#333', 
                        fontSize: '14px' 
                      }}
                      onClick={() => setMenuDropdownOpen(false)}
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-actions {
            display: none !important;
          }
          .mobile-actions {
            display: flex !important;
          }
          .search-desktop {
            display: none !important;
          }
        }
        
        @media (min-width: 769px) {
          .desktop-actions {
            display: flex !important;
          }
          .mobile-actions {
            display: none !important;
          }
          .search-desktop {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}