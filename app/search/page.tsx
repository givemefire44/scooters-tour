import { client } from '@/sanity/lib/client';
import Container from '@/app/components/Container';
import TourGrid from '@/app/components/TourGrid';
import Footer from '@/app/components/Footer';
import PopularDestinations from '@/app/components/PopularDestinations';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: { q?: string };
}

async function searchTours(query: string) {
    if (!query || query.length < 2) return { tours: [], categories: [] };
  
    const searchPattern = `*${query}*`;
  
    const tours = await client.fetch(`
      *[_type == "post" && title match $searchPattern] | order(_createdAt desc)[0...30] {
        _id,
        title,
        "slug": slug.current,
        seoDescription,
        mainImage {
          asset-> { _id, url },
          alt
        },
        heroGallery[] {
          asset-> { _id, url },
          alt
        },
        tourInfo,
        tourFeatures,
        getYourGuideData
      }
    `, { searchPattern });
  
    const categories = await client.fetch(`
      *[_type == "category" && title match $searchPattern][0...5] {
        _id,
        title,
        "slug": slug.current,
        "tourCount": count(*[_type == "post" && references(^._id)])
      }
    `, { searchPattern });
  
    return { tours, categories };
  }

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const { tours, categories } = await searchTours(query);

  return (
    <>
      <Container>
        <div style={{ padding: '40px 0 20px' }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#1a1a1a'
          }}>
            {query ? `Search results for "${query}"` : 'Search Tours'}
          </h1>
          
          {query && (
            <p style={{ color: '#666', fontSize: '1rem' }}>
              Found {tours.length} tour{tours.length !== 1 ? 's' : ''}
              {categories.length > 0 && ` and ${categories.length} destination${categories.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </Container>

      {/* Categorías encontradas */}
      {categories.length > 0 && (
        <Container>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#333'
            }}>
              🛵 Destinations
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {categories.map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="destination-chip"
                >
                  {cat.title.split(' Vespa Tours')[0].split(' Tours')[0]}
                  <span style={{
                    marginLeft: '6px',
                    background: '#f0f0f0',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {cat.tourCount}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      )}

      {/* Tours encontrados */}
      <Container>
        <div style={{ paddingBottom: '40px' }}>
          {query && (
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '30px',
              color: '#333'
            }}>
              Tours
            </h2>
          )}
          
          <TourGrid 
            posts={tours} 
            emptyMessage={query ? `No tours found for "${query}"` : 'Enter a search term to find tours'}
          />
        </div>
      </Container>

      <PopularDestinations />
      <Footer />
    </>
  );
}