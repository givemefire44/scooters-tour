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
    const countrySearch = query.toLowerCase();

    // Buscar tours - por título, categoría O país de la categoría
    const tours = await client.fetch(
      `*[_type == "post" && (
        title match $pattern ||
        count(categories[@->title match $pattern]) > 0 ||
        count(categories[@->country == $countrySearch]) > 0
      )] | order(getYourGuideData.rating desc)[0...8] {
        _id,
        title,
        "slug": slug.current,
        seoDescription,
        mainImage { asset-> { _id, url }, alt },
        heroGallery[] { asset-> { _id, url }, alt },
        tourInfo,
        tourFeatures,
        getYourGuideData,
        "country": categories[0]->country
      }`,
      { pattern: searchPattern, countrySearch }
    );

    // Si hay pocos resultados (menos de 5), completar con tours del mismo país
    let finalTours = tours;
    
    if (tours.length > 0 && tours.length < 8) {
      const country = tours[0]?.country;
      
      if (country) {
        const existingIds = tours.map((t: any) => t._id);
        
        const moreTours = await client.fetch(
          `*[_type == "post" && 
            count(categories[@->country == $country]) > 0 &&
            !(_id in $existingIds)
          ] | order(getYourGuideData.rating desc)[0...$limit] {
            _id,
            title,
            "slug": slug.current,
            seoDescription,
            mainImage { asset-> { _id, url }, alt },
            heroGallery[] { asset-> { _id, url }, alt },
            tourInfo,
            tourFeatures,
            getYourGuideData,
            "country": categories[0]->country
          }`,
          { country, existingIds, limit: 5 - tours.length }
        );
        
        finalTours = [...tours, ...moreTours];
      }
    }

    // Buscar categorías - por título O país
    const categories = await client.fetch(
      `*[_type == "category" && (
        title match $pattern ||
        country == $countrySearch
      )][0...5] {
        _id,
        title,
        "slug": slug.current,
        country,
        "tourCount": count(*[_type == "post" && references(^._id)])
      }`,
      { pattern: searchPattern, countrySearch }
    );

    return NextResponse.json({ tours: finalTours, categories, query });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ tours: [], categories: [], error: 'Search failed' });
  }
}