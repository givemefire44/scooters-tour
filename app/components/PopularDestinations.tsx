import Link from 'next/link';
import { client } from '@/sanity/lib/client';

async function getPopularDestinations() {
  return await client.fetch(`
    *[_type == "category"] {
      title,
      "slug": slug.current,
      "tourCount": count(*[_type == "post" && references(^._id)])
    } | order(tourCount desc)
  `, {}, {
    next: { revalidate: 300 }
  });
}

export default async function PopularDestinations() {
  const destinations = await getPopularDestinations();
  
  const activeDestinations = destinations.filter(
    (dest: any) => dest.tourCount > 0
  );

  if (activeDestinations.length === 0) return null;

  return (
    <section style={{
      padding: '2rem 1rem 0',
      marginTop: '2rem',
      marginBottom: '0'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#333',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          🛵 Popular Destinations
        </h3>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px'
        }}>
          {activeDestinations.map((dest: any) => (
            <Link
              key={dest.slug}
              href={`/${dest.slug}`}
              className="destination-chip"
            >
              {dest.title.split(' Vespa Tours')[0].split(' Tours')[0]}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}