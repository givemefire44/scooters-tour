import Link from 'next/link';

export default function PopularDestinationsClient({ destinations = [] }: { destinations?: any[] }) {
  if (!destinations || destinations.length === 0) return null;

  return (
    <div style={{ padding: '2rem 0', marginTop: '2rem' }}>
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
        {destinations.map((dest: any) => {
          const slugValue = dest.slug?.current || dest.slug;
          if (!slugValue) return null;
          return (
            <Link
              key={slugValue}
              href={`/${slugValue}`}
              className="destination-chip"
            >
              {dest.title?.split(' Vespa Tours')[0]?.split(' Tours')[0] || dest.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}