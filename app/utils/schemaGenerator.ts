// app/utils/schemaGenerator.ts

// Tipos específicos para Schema.org
interface ImageObject {
  '@type': 'ImageObject';
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface Organization {
  '@type': 'Organization';
  name: string;
  logo?: ImageObject;
  url?: string;
}

interface Person {
  '@type': 'Person';
  name: string;
  url?: string;
}

// Tipos base para diferentes schemas
interface BaseSchemaProperties {
  '@context': 'https://schema.org';
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author?: Organization | Person;
  publisher?: Organization;
}

// Schemas específicos con sus propiedades únicas
interface ArticleSchema extends BaseSchemaProperties {
  '@type': 'Article';
  headline: string;
  image?: ImageObject | ImageObject[];
  articleBody?: string;
  wordCount?: number;
}

interface WebPageSchema extends BaseSchemaProperties {
  '@type': 'WebPage';
  image?: ImageObject;
  breadcrumb?: any;
}

interface HowToSchema extends BaseSchemaProperties {
  '@type': 'HowTo';
  image?: ImageObject | ImageObject[];
  step?: any[];
  totalTime?: string;
}

interface FAQPageSchema extends BaseSchemaProperties {
  '@type': 'FAQPage';
  mainEntity?: any[];
}

interface ItemListSchema extends BaseSchemaProperties {
  '@type': 'ItemList';
  itemListElement?: any[];
  numberOfItems?: number;
}

interface ReviewSchema extends BaseSchemaProperties {
  '@type': 'Review';
  reviewRating?: any;
  author?: Person;
  itemReviewed?: any;
}

// 🆕 NUEVO: About Page Schema
interface AboutPageSchema {
  '@context': 'https://schema.org';
  '@type': 'AboutPage';
  mainEntity: any;
}

// Union type para todos los schemas posibles
type Schema = ArticleSchema | WebPageSchema | HowToSchema | FAQPageSchema | ItemListSchema | ReviewSchema | AboutPageSchema;

// Tipos para los datos de entrada
interface PageData {
  title: string;
  slug: { current: string };
  seoDescription?: string;
  seoImage?: any;
  publishedAt?: string;
  richSnippets?: any;
  schemaType?: 'Article' | 'WebPage' | 'HowTo' | 'FAQPage' | 'ItemList' | 'Review';
  author?: string;
  articleBody?: string;
  wordCount?: number;
  steps?: any[];
  totalTime?: string;
  faqItems?: any[];
  listItems?: any[];
  reviewRating?: any;
  itemReviewed?: any;
}

export function generatePageSchema(pageData: PageData, baseUrl = 'https://colosseumroman.com'): Schema {
  // 🆕 SPECIAL CASE: About Us Page
  if (pageData.slug.current === 'about-us') {
    return {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      mainEntity: {
        '@type': 'Organization',
        name: 'Colosseum Roman',
        alternateName: 'ColosseumRoman.com',
        url: 'https://colosseumroman.com',
        logo: 'https://colosseumroman.com/logo.png',
        foundingDate: '2006',
        description: 'Expert curators of the best Colosseum tours and comprehensive Rome travel guides. Independent affiliate partner of GetYourGuide and Viator.',
        
        founder: {
          '@type': 'Person',
          name: 'Mario Dalo',
          jobTitle: 'Founder & Rome Travel Curator',
          nationality: 'Argentine',
          knowsAbout: [
            'Roman Colosseum',
            'Rome Tourism',
            'Historical Tours',
            'Travel Planning'
          ],
          sameAs: [
            'https://linkedin.com/in/mariodalo'
          ]
        },
        
        parentOrganization: {
          '@type': 'Organization',
          name: 'Intercoper Argentina',
          foundingDate: '2006',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Larrea 1280',
            addressLocality: 'Buenos Aires',
            addressRegion: 'CABA',
            postalCode: 'C1117',
            addressCountry: 'AR'
          }
        },
        
        areaServed: {
          '@type': 'Place',
          name: 'Rome, Italy'
        },
        
        knowsAbout: [
          'Roman Colosseum',
          'Ancient Rome History',
          'Rome Tourism',
          'Historical Tours',
          'Travel Planning',
          'Roman Forum',
          'Palatine Hill'
        ],
        
        sameAs: [
          'https://instagram.com/colosseumroman'
        ],
        
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'hello@colosseumroman.com',
          contactType: 'Customer Service',
          availableLanguage: ['English', 'Spanish']
        }
      }
    } as AboutPageSchema;
  }

  // Generar URL desde slug
  const pageUrl = `${baseUrl}/${pageData.slug.current}`;
  
  // Usar seoDescription como description
  const description = pageData.seoDescription || pageData.title;

  // 🆕 DETECTAR SCHEMA TYPE DESDE RICH SNIPPETS (prioridad) O SCHEMA TYPE MANUAL
  const schemaType = pageData.richSnippets?.schemaType || pageData.schemaType || 'WebPage';
  
  // Propiedades base comunes
  const baseProperties: BaseSchemaProperties = {
    '@context': 'https://schema.org',
    name: pageData.title,
    description: description,
    url: pageUrl,
    datePublished: pageData.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Colosseum Roman',
      url: 'https://colosseumroman.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Colosseum Roman',
      logo: {
        '@type': 'ImageObject',
        url: 'https://colosseumroman.com/logo.png',
        alt: 'Colosseum Roman Logo'
      },
      url: 'https://colosseumroman.com'
    }
  };

  // Crear imagen si existe
  const imageObject: ImageObject | undefined = pageData.seoImage ? {
    '@type': 'ImageObject',
    url: pageData.seoImage.asset?.url || pageData.seoImage.url || '',
    alt: pageData.seoImage.alt || pageData.title,
    ...(pageData.seoImage.width && { width: pageData.seoImage.width }),
    ...(pageData.seoImage.height && { height: pageData.seoImage.height })
  } : undefined;

  // 🆕 GENERAR SCHEMA ESPECÍFICO CON DATOS DE RICH SNIPPETS
  switch (schemaType) {
    case 'Article':
      return {
        ...baseProperties,
        '@type': 'Article',
        headline: pageData.title,
        ...(imageObject && { image: imageObject }),
        ...(pageData.richSnippets?.wordCount && { wordCount: pageData.richSnippets.wordCount }),
        ...(pageData.richSnippets?.readingTime && {
          timeRequired: `PT${pageData.richSnippets.readingTime}M`
        }),
        ...(pageData.richSnippets?.about && {
          about: {
            '@type': pageData.richSnippets.about.type,
            name: pageData.richSnippets.about.name
          }
        })
      } as ArticleSchema;

    case 'HowTo':
      return {
        ...baseProperties,
        '@type': 'HowTo',
        ...(imageObject && { image: imageObject }),
        ...(pageData.richSnippets?.timeRequired && { 
          totalTime: pageData.richSnippets.timeRequired 
        }),
        ...(pageData.richSnippets?.difficulty && {
          difficulty: pageData.richSnippets.difficulty
        }),
        ...(pageData.richSnippets?.estimatedCost && {
          estimatedCost: {
            '@type': 'MonetaryAmount',
            currency: pageData.richSnippets.estimatedCost.currency,
            value: pageData.richSnippets.estimatedCost.minValue
          }
        }),
        ...(pageData.richSnippets?.steps && {
          step: pageData.richSnippets.steps.map((step: any, index: number) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
            ...(step.url && { url: step.url })
          }))
        })
      } as HowToSchema;

    case 'FAQPage':
      return {
        ...baseProperties,
        '@type': 'FAQPage',
        ...(pageData.richSnippets?.faqItems && {
          mainEntity: pageData.richSnippets.faqItems.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          }))
        })
      } as FAQPageSchema;

    case 'ItemList':
      return {
        ...baseProperties,
        '@type': 'ItemList',
        ...(pageData.richSnippets?.itemList && {
          itemListElement: pageData.richSnippets.itemList.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            ...(item.description && { description: item.description }),
            ...(item.url && { url: item.url })
          })),
          numberOfItems: pageData.richSnippets.itemList.length
        })
      } as ItemListSchema;

    case 'Review':
      return {
        ...baseProperties,
        '@type': 'Review',
        author: pageData.author ? {
          '@type': 'Person',
          name: pageData.author
        } : baseProperties.author,
        ...(pageData.reviewRating && { reviewRating: pageData.reviewRating }),
        ...(pageData.itemReviewed && { itemReviewed: pageData.itemReviewed })
      } as ReviewSchema;

    default: // 'WebPage'
      return {
        ...baseProperties,
        '@type': 'WebPage',
        ...(imageObject && { image: imageObject }),
        ...(pageData.richSnippets?.about && {
          about: {
            '@type': pageData.richSnippets.about.type,
            name: pageData.richSnippets.about.name
          }
        })
      } as WebPageSchema;
  }
}

// Helper function para generar breadcrumb schema
export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
}

// Helper function para FAQ schema
export function generateFAQSchema(faqs: Array<{question: string, answer: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}
