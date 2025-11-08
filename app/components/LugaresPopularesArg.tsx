'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export default function LugaresPopularesArg() {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDestinationData() {
      try {
        console.log('🔥 Cargando destinos desde Sanity...');
        
        const query = `*[_type == "destinationCard" && active == true] | order(order asc) {
          nombre,
          image,
          url,
          order
        }`;
        
        const sanityData = await client.fetch(query, {}, {
          next: { revalidate: 3600 }
        });
        
        if (sanityData && sanityData.length > 0) {
          const convertedData = sanityData.map(item => ({
            nombre: item.nombre,
            img: urlFor(item.image).width(400).height(300).format('webp').quality(85).url(),
            url: item.url || '#'
          }));
          
          setLugares(convertedData);
          console.log('✅ Destinos cargados desde Sanity:', convertedData.length, 'items');
        }
      } catch (error) {
        console.error('❌ Error cargando destinos desde Sanity:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDestinationData();
  }, []);

  // Si no hay datos, no renderizar nada
  if (loading) {
    return (
      <section className="lugares-populares">
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Cargando destinos...
        </div>
      </section>
    );
  }

  if (lugares.length === 0) {
    return null; // No renderizar si no hay datos
  }

  return (
    <section className="lugares-populares">
      <div className="lugares-populares-masonry">
        {lugares.map((lugar, i) => (
          <Link
            href={lugar.url}
            key={`${lugar.nombre}-${i}`}
            className={`lugar-card-masonry lugar-card-masonry-${i + 1}`}
            aria-label={`Ver más de ${lugar.nombre}`}
          >
            <div className="lugar-image-container">
              <Image
                src={lugar.img}
                alt={lugar.nombre}
                fill
                style={{ 
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
            <span className="lugar-card-titulo">{lugar.nombre}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}