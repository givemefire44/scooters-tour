import { notFound } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { Metadata } from 'next';

// Componentes
import CategoryPageClient from './CategoryPageClient';
import StaticPageClient from './StaticPageClient';
import TourPageClient from '@/app/tour/[slug]/TourPageClient';

// Queries
import { getFeaturedCategories, getAllCategories } from '@/app/utils/categoryQueries';

// ========================================
// CONFIGURACIÓN
// ========================================
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://scooterstour.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'ScootersTour';

const cacheConfig = {
  next: { revalidate: 3600 }
};

// ========================================
// QUERIES A SANITY
// ========================================

// QUERY: CATEGORÍA
async function getCategory(slug: string) {
  const query = `*[_type == "category" && slug.current == $slug][0]{
    _type,
    title,
    slug,
    description,
    longDescription,
    editorialTitle,  
    featuredText,
    seoTitle,
    seoDescription,
    seoKeywords,
    seoImage {
      asset-> { url },
      alt
    },
    image {
      asset-> { url },
      alt,
      heading
    },
    pageContent{
      heroTitle,
      heroSubtitle,
      highlights[]
    },
    faqs[]{
      question,
      answer
    },
    metaTitle,
    metaDescription
  }`;

  return await client.fetch(query, { slug }, cacheConfig);
}

// QUERY: TOUR
async function getTour(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _type,
    title,
    slug,
"category": coalesce(
  categories[0]->{ title, slug },
  category->{ title, slug }
),
    seoTitle,
    seoDescription,
    seoKeywords,
    seoImage{ asset->{ url }, alt },
    mainImage{ asset->{ url }, alt },
    heroGallery[]{ asset->{ url }, alt },
    body,
    publishedAt,
    author->{ name },
    tourInfo{
      duration,
      price,
      currency,
      location,
      platform
    },
    tourFeatures{
      freeCancellation,
      skipTheLine,
      wheelchairAccessible,
      hostGuide,
      audioGuide,
      smallGroupAvailable
    },
    getYourGuideTourId,
    getYourGuideUrl,
    bookingUrl,
    getYourGuideData{
      rating,
      reviewCount,
      provider,
      lastUpdated
    }
  }`;

  return await client.fetch(query, { slug }, cacheConfig);
}

// QUERY: PAGE (ESTÁTICA/ARTÍCULO)
async function getPage(slug: string) {
  const query = `*[_type == "page" && slug.current == $slug][0]{
    _type,
    title,
    slug,
    content[]{
      ...,
      _type == "image" => {
        _type,
        asset->{ _id, url },
        alt,
        caption
      },
      _type == "imageGallery" => {
        _type,
        title,
        layout,
        images[]{
          asset->{ _id, url },
          alt,
          caption
        }
      },
      _type == "imageWithText" => {
        _type,
        layout,
        image{ asset->{ _id, url }, alt },
        text
      },
      _type == "ctaBox" => {
        _type,
        title,
        description,
        buttonText,
        buttonUrl,
        style
      },
      _type == "simpleTable" => {
        _type,
        title,
        rows[]{ cells[] }
      },
      _type == "block" => {
        ...,
        markDefs[]{
          ...,
          _type == "link" => { _type, href, blank }
        }
      }
    },
    pageType,
    heroImage{
      asset->{ _id, url },
      alt,
      heading
    },
    heroContent{
      heroTitle,
      heroSubtitle,
      excerpt,
      customText
    },
    highlights[]{
      title,
      description,
      icon
    },
pageSettings{
  showRecommendedTours,
  recommendedTours[]->{
    _id,
    title,
    slug,
    heroImage{ asset->{ _id, url }, alt },
    tourInfo{ duration, price, currency, location },
    getYourGuideData{ rating, reviewCount }
  },
  backgroundColor,
  ctaText,
  ctaUrl
},
    sidebarWidget{
      showWidget,
      ctaTitle,
      ctaDescription,
      ctaButtonText,
      ctaButtonUrl,
      widgetImage{ asset->{ _id, url }, alt },
      quickLinks[]{ title, url, icon }
    },
    seoTitle,
    seoDescription,
    seoKeywords,
    seoImage{ asset->{ _id, url }, alt },
    publishedAt,
    _updatedAt,
    seo{ metaTitle, metaDescription },
    richSnippets{
      schemaType,
      readingTime,
      wordCount,
      difficulty,
      estimatedCost{ currency, minValue, maxValue },
      timeRequired,
      about{ name, type },
      steps[]{ name, text, url },
      faqItems[]{ question, answer },
      itemList[]{ name, description, url },
      rating{ ratingValue, bestRating, worstRating }
    }
  }`;

  return await client.fetch(query, { slug }, cacheConfig);
}

// QUERY: POSTS POR CATEGORÍA
async function getPostsByCategory(categorySlug: string) {
  const query = `*[_type == "post" && references(*[_type == "category" && slug.current == $categorySlug]._id)]| order(_createdAt desc)[0...200]{
    title,
    slug,
    seoDescription,
    seoImage { asset-> { url }, alt },
    heroGallery[] { asset-> { url }, alt },
    tourInfo{ duration, price, currency },
    tourFeatures{ skipTheLine, smallGroupAvailable, freeCancellation },
    getYourGuideData{ rating, reviewCount },
    "categoryTitle": category->title
  }`;

  return await client.fetch(query, { categorySlug }, cacheConfig);
}

// QUERY: TOURS DESTACADOS (híbrido: rating + recientes)  ← CÓDIGO NUEVO
async function getRecommendedTours() {
  const query = `*[_type == "post" && defined(getYourGuideData.rating)] 
    | order(getYourGuideData.rating desc, _createdAt desc)[0...60] {
    _id, title, slug,
    mainImage { asset-> { url }, alt },
    heroGallery[] { asset-> { url }, alt },
    body,
    getYourGuideData{ rating, reviewCount }
  }`;

  return await client.fetch(query, {}, { next: { revalidate: 1800 } });
}  

// QUERY: TOURS RELACIONADOS - ✅ DIVERSIDAD + CALIDAD
async function getRelatedTours(currentSlug: string) {
  // Primero obtenemos las categorías del tour actual
  const currentTour = await client.fetch(
    `*[_type == "post" && slug.current == $currentSlug][0]{
      "categoryIds": categories[]._ref
    }`,
    { currentSlug },
    cacheConfig
  );

  const categoryIds = currentTour?.categoryIds || [];

  // Tours de OTRAS categorías (diversidad) + mejor rating
  const query = `*[
    _type == "post" 
    && slug.current != $currentSlug 
    && !(_id in path("drafts.**"))
    && count((categories[]._ref)[@ in $categoryIds]) == 0
    && defined(getYourGuideData.rating)
  ] | order(getYourGuideData.rating desc)[0...3]{
    _id, title, slug,
    mainImage{ asset->{ url }, alt },
    heroGallery[]{ asset->{ url }, alt },
    body
  }`;

  return await client.fetch(
    query, 
    { currentSlug, categoryIds }, 
    cacheConfig
  );
}

// ========================================
// METADATA GENERATOR
// ========================================
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;

  // 🔍 Buscar en paralelo (prioridad: categoría > tour > page)
  const [category, tour, page] = await Promise.all([
    getCategory(slug),
    getTour(slug),
    getPage(slug)
  ]);

  // METADATA: CATEGORÍA
  if (category) {
    const canonical = `${SITE_URL}/${category.slug.current}`;
    const title = category.seoTitle || category.metaTitle || `${category.title} Tours | ${SITE_NAME}`;
    const description = category.seoDescription || category.metaDescription || category.description || `Discover amazing ${category.title} tours`;
    const keywords = category.seoKeywords || [category.title.toLowerCase(), 'tours'];

    const socialImage = category.seoImage?.asset?.url
      ? urlFor(category.seoImage).width(1200).height(630).format('webp').quality(85).url()
      : category.image?.asset?.url
        ? urlFor(category.image).width(1200).height(630).format('webp').quality(85).url()
        : `${SITE_URL}/images/default-category.jpg`;

    return {
      title,
      description,
      keywords,
      authors: [{ name: SITE_NAME }],
      openGraph: {
        type: 'website',
        url: canonical,
        title,
        description,
        siteName: SITE_NAME,
        images: [{ url: socialImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [socialImage],
      },
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }

  // METADATA: TOUR
  if (tour) {
    const canonical = `${SITE_URL}/${tour.slug.current}`;
    const title = tour.seoTitle || tour.title;
    const description = tour.seoDescription || `Discover ${tour.title}`;
    const socialImage = tour.seoImage 
      ? urlFor(tour.seoImage).width(1200).height(630).url()
      : `${SITE_URL}/images/default-social.jpg`;

    return {
      title,
      description,
      keywords: tour.seoKeywords || [],
      authors: [{ name: SITE_NAME }],
      openGraph: {
        type: 'website',
        url: canonical,
        title,
        description,
        siteName: SITE_NAME,
        images: [{ url: socialImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [socialImage],
      },
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }

  // METADATA: PAGE
  if (page) {
    const canonical = `${SITE_URL}/${page.slug.current}`;
    const title = page.seoTitle || page.seo?.metaTitle || `${page.title} | ${SITE_NAME}`;
    const description = page.seoDescription || page.seo?.metaDescription || 
      page.heroContent?.excerpt || `Learn more about ${page.title}`;
    const keywords = page.seoKeywords || [page.title.toLowerCase(), SITE_NAME.toLowerCase()];

    const socialImage = page.seoImage 
      ? urlFor(page.seoImage).width(1200).height(630).format('webp').quality(85).url()
      : page.heroImage 
        ? urlFor(page.heroImage).width(1200).height(630).format('webp').quality(85).url()
        : `${SITE_URL}/images/default-page.jpg`;

    return {
      title,
      description,
      keywords,
      authors: [{ name: SITE_NAME }],
      openGraph: {
        type: 'website',
        url: canonical,
        title,
        description,
        siteName: SITE_NAME,
        images: [{ url: socialImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [socialImage],
      },
      alternates: { canonical },
      robots: { index: true, follow: true },
    };
  }

  // NO ENCONTRADO
  return {
    title: 'Page Not Found',
    description: 'This page doesn\'t exist.'
  };
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export default async function UnifiedPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  // 🔍 Buscar en paralelo (OPTIMIZADO)
  // Prioridad: categoría > tour > page
  const [category, tour, page, featuredCategories, allCategories] = await Promise.all([
    getCategory(slug),
    getTour(slug),
    getPage(slug),
    getFeaturedCategories(),
    getAllCategories()
  ]);

  // ========================================
  // CASO 1: ES UNA CATEGORÍA (prioridad más alta)
  // ========================================
  if (category) {
    const posts = await getPostsByCategory(slug);
    const recommendedTours = await getRecommendedTours(slug);

    return (
      <CategoryPageClient 
        category={category}
        posts={posts}
        recommendedTours={recommendedTours}
        featuredCategories={featuredCategories}
        allCategories={allCategories}
      />
    );
  }

  // ========================================
  // CASO 2: ES UN TOUR
  // ========================================
  if (tour) {
    const relatedPosts = await getRelatedTours(slug);
    const recommendedPosts = await getRecommendedTours();

    return (
      <TourPageClient 
        post={tour}
        relatedPosts={relatedPosts}
        recommendedPosts={recommendedPosts}
        featuredCategories={featuredCategories}
        allCategories={allCategories}
      />
    );
  }

  // ========================================
  // CASO 3: ES UNA PAGE (artículo/institucional)
  // ========================================
  if (page) {
    const recommendedTours = page.pageSettings?.showRecommendedTours 
      ? await getRecommendedTours() 
      : [];

    return (
      <StaticPageClient 
        page={page} 
        slug={slug} 
        recommendedTours={recommendedTours}
        featuredCategories={featuredCategories}
        allCategories={allCategories}
      />
    );
  }

  // ========================================
  // CASO 4: NO ENCONTRADO
  // ========================================
  notFound();
}