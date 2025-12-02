// app/utils/categoryQueries.ts

import { client } from '@/sanity/lib/client';

const cacheConfig = {
  next: { revalidate: 3600 } // Cache por 1 hora
};

// Traer categorías featured (Popular Destinations)
export async function getFeaturedCategories() {
  const query = `*[_type == "category" && featured == true] | order(title asc) [0...6] {
    title,
    "slug": slug.current
  }`;

  return await client.fetch(query, {}, cacheConfig);
}

// Traer TODAS las categorías (para el search)
export async function getAllCategories() {
  const query = `*[_type == "category"] | order(title asc) {
    title,
    "slug": slug.current
  }`;

  return await client.fetch(query, {}, cacheConfig);
}