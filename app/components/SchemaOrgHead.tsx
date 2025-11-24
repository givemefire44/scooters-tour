// app/components/SchemaOrgHead.tsx
import { generatePageSchema } from '@/app/utils/schemaGenerator';

interface SchemaOrgHeadProps {
  pageData: {
    title: string;
    slug: { current: string };
    seoDescription?: string;
    seoImage?: any;
    publishedAt?: string;
    richSnippets?: any;
  };
  baseUrl?: string;
}

export default function SchemaOrgHead({ pageData, baseUrl = 'https://scooterstour.com' }: SchemaOrgHeadProps) {
  const pageSchema = generatePageSchema(pageData, baseUrl);

  if (!pageSchema) {
    return null;
  }

  return (
    <>
      {/* Page Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageSchema, null, 2)
        }}
      />
    </>
  );
}