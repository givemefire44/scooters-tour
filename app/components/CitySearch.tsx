"use client";

import React, { useState, useRef } from "react";

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

export default function CitySearch() {
  const [busqueda, setBusqueda] = useState("");
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        const formattedTours = data.tours.slice(0, 5).map((tour: any) => ({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBusqueda(value);
    setShow(true);
    setHovered(null);
    
    const timeoutId = setTimeout(() => {
      searchTours(value);
    }, 200);

    return () => clearTimeout(timeoutId);
  };

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
      setShow(false);
      setHovered(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      goToSearch(busqueda);
    }
  };

  return (
    <form
      className="search-bar-wrap"
      autoComplete="off"
      onSubmit={handleSearch}
    >
      <div className="search-bar vedette">
        <span className="search-icon">
          <svg width={22} height={22} fill="none" stroke="#6c6c6c" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tours & activities... (e.g. Rome, Florence, Milan)"
          value={busqueda}
          onChange={handleInputChange}
          onFocus={() => { if (busqueda.length >= 2) setShow(true); }}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        {busqueda && (
          <button
            type="button"
            className="clear-btn"
            aria-label="Clear"
            onClick={() => {
              setBusqueda("");
              setShow(false);
              setHovered(null);
              setTours([]);
              inputRef.current?.focus();
            }}
          >
            <svg width={18} height={18} viewBox="0 0 20 20">
              <line x1="5" y1="5" x2="15" y2="15" stroke="#444" strokeWidth="2"/>
              <line x1="15" y1="5" x2="5" y2="15" stroke="#444" strokeWidth="2"/>
            </svg>
          </button>
        )}
        <button
          className="vamos-btn maize"
          type="submit"
          disabled={!busqueda.trim()}
        >
          <span className="buscar-text">Search Tours!</span>
          <span className="buscar-arrow" aria-hidden="true">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" stroke="#18120b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12.5" x2="19" y2="12.5"/>
              <polyline points="12.5,6 19,12.5 12.5,19"/>
            </svg>
          </span>
        </button>
      </div>
      
      {/* DROPDOWN CON RESULTADOS */}
      {show && busqueda.length >= 2 && (
        <div style={{
          position: "absolute",
          left: "15px",
          top: "110%",
          width: "calc(100% - 30px)",
          background: "white",
          border: "1px solid #e0e0e0",
          borderRadius: "15px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          maxHeight: "400px",
          overflowY: "auto",
          zIndex: 30,
          marginTop: "7px"
        }}>
          {loading && (
            <div style={{
              padding: "16px",
              textAlign: "center",
              color: "#666"
            }}>
              🔄 Searching...
            </div>
          )}
          
          {!loading && tours.length === 0 && (
            <div style={{
              padding: "16px",
              textAlign: "center",
              color: "#666"
            }}>
              🔍 No tours found
            </div>
          )}
          
          {!loading && tours.length > 0 && (
            <>
              {/* DESTINATIONS */}
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
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
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
                        marginBottom: '4px', 
                        color: '#333',
                        lineHeight: 1.3
                      }}>
                        {tour.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {tour.price > 0 && (
                          <span style={{ color: '#e91e63', fontWeight: '600' }}>
                            ${tour.price}
                          </span>
                        )}
                        {tour.duration && <span>{tour.duration}</span>}
                        {tour.rating > 0 && (
                          <span>⭐ {tour.rating.toFixed(1)} ({tour.reviewCount})</span>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <div style={{ marginLeft: '8px' }}>
                        <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="8" stroke="#8f2fbf" strokeWidth="2"/>
                          <path d="M7 10.5L9.5 13 13 8.5" stroke="#8f2fbf" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* SEE ALL RESULTS */}
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
    </form>
  );
}