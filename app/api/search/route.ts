import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ tours: [], categories: [] });
  }

  try {
    const searchPattern = `*${query}*`;

    // Buscar tours - por título O por categoría
    const tours = await client.fetch(
      `*[_type == "post" && (
        title match $pattern ||
        count(categories[@->title match $pattern]) > 0
      )] | order(_createdAt desc)[0...30] {
        _id,
        title,
        "slug": slug.current,
        seoDescription,
        mainImage { asset-> { _id, url }, alt },
        heroGallery[] { asset-> { _id, url }, alt },
        tourInfo,
        tourFeatures,
        getYourGuideData
      }`,
      { pattern: searchPattern }
    );

    // Buscar categorías
    const categories = await client.fetch(
      `*[_type == "category" && title match $pattern][0...5] {
        _id,
        title,
        "slug": slug.current,
        "tourCount": count(*[_type == "post" && references(^._id)])
      }`,
      { pattern: searchPattern }
    );

    return NextResponse.json({ tours, categories, query });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ tours: [], categories: [], error: 'Search failed' });
  }
}