'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface LugaresPopularesArgProps {
  destinations?: any[];
}

export default function LugaresPopularesArg({ destinations = [] }: LugaresPopularesArgProps) {
  // Si no hay datos, no renderizar nada
  if (!destinations || destinations.length === 0) {
    return null;
  }

  // Convertir datos de Sanity a formato del componente
  const lugares = destinations.map(item => ({
    nombre: item.nombre,
    img: urlFor(item.image).width(400).height(300).format('webp').quality(85).url(),
    url: item.url || '#'
  }));

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
            <div 
              className="lugar-image-container"
              style={{ 
                position: 'relative',
                width: '100%',
                height: '100%'
              }}
            >
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