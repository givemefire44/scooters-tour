'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

function getCardClass(i: number) {
  let classes = "hostel-mosaic-card";
  if (i % 3 === 0) classes += " mt-24";
  if (i % 3 === 2) classes += " mb-24";
  if (i % 2 === 0) classes += " rotate-neg";
  else classes += " rotate-pos";
  return classes;
}

function getCardStyle(i: number) {
  return {
    transform: i % 2 === 0 ? "rotate(-8deg)" : "rotate(8deg)"
  };
}

export default function HostelMosaic() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMosaicData() {
      try {
        console.log('🔥 Cargando datos del mosaic desde Sanity...');
        
        const query = `*[_type == "mosaicCard" && active == true] | order(order asc) {
          name,
          location,
          image,
          url,
          order
        }`;
        
        const sanityData = await client.fetch(query, {}, {
          next: { revalidate: 3600 }
        });
        
        if (sanityData && sanityData.length > 0) {
          const convertedData = sanityData.map(item => ({
            name: item.name,
            location: item.location || '',
            img: urlFor(item.image).width(400).height(300).format('webp').quality(85).url(),
            url: item.url || '#'
          }));
          
          setHostels(convertedData);
          console.log('✅ Datos cargados desde Sanity:', convertedData.length, 'items');
        }
      } catch (error) {
        console.error('❌ Error cargando datos del mosaic:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMosaicData();
  }, []);

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="hostel-mosaic-section">
        <div className="hostel-mosaic-container">
          <div className="hostel-mosaic-info">
            <h2>
              <span className="highlight">Unforgettable tours on two wheels, feel the wind, live the adventure.</span>
            </h2>
            <div className="hostel-mosaic-info-description">
              Don't forget book your Scooter Tour in Advance!
            </div>
          </div>
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Cargando tours...
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos, no mostrar nada
  if (hostels.length === 0) {
    return null;
  }

  return (
    <div className="hostel-mosaic-section">
      <div className="hostel-mosaic-container">
        <div className="hostel-mosaic-info">
          <h2>
            <span className="highlight">Unforgettable tours on two wheels, feel the wind, live the adventure.</span>
          </h2>
          <div className="hostel-mosaic-info-description">
          Don't forget book your Scooter Tour in Advance!
          </div>
        </div>
        <div className="hostel-mosaic-list">
          {hostels.slice(0, 9).map((h, i) => (
            <Link 
              href={h.url} 
              key={`${h.name}-${i}`}
              className={getCardClass(i)}
              style={getCardStyle(i)}
            >
              <div className="hostel-image-container">
                <Image
                  src={h.img}
                  alt={h.name}
                  fill
                  style={{ 
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
              <div className="hostel-mosaic-card-content">
                <div className="hostel-mosaic-card-title">{h.name}</div>
                <div className="hostel-mosaic-card-location">{h.location}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}