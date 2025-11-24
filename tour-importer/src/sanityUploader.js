// src/sanityUploader.js
import { createClient } from '@sanity/client';
import { config } from '../config.js';

const client = createClient({
  projectId: config.sanity.projectId,
  dataset: config.sanity.dataset,
  token: config.sanity.token,
  apiVersion: config.sanity.apiVersion,
  useCdn: false
});

/**
 * Sube una imagen a Sanity y retorna el asset reference
 */
async function uploadImage(imageData) {
  try {
    const asset = await client.assets.upload('image', imageData.buffer, {
      filename: imageData.filename,
      contentType: imageData.mimeType
    });
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      },
      alt: imageData.alt || ''
    };
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error.message);
    throw error;
  }
}

/**
 * Sube todas las imágenes del tour
 */
async function uploadTourImages(processedImages) {
  console.log(`\n📤 Subiendo ${processedImages.length} imágenes a Sanity...`);
  
  const uploadedImages = [];
  
  for (let i = 0; i < processedImages.length; i++) {
    console.log(`   [${i + 1}/${processedImages.length}] Subiendo imagen...`);
    
    const imageRef = await uploadImage(processedImages[i]);
    uploadedImages.push(imageRef);
    
    console.log(`   ✅ Imagen ${i + 1} subida`);
  }
  
  console.log(`✅ ${uploadedImages.length} imágenes subidas exitosamente`);
  
  return uploadedImages;
}

/**
 * Genera slug único desde título
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[🛵🏛️📸🍰🧡⭐✅❌ℹ️📊🔚👉💰⏱️💡💬🪖👨‍🏫☕🏨🍽️❓]/g, '') // Remover emojis
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales
    .replace(/^-+|-+$/g, '') // Remover guiones al inicio/fin
    .substring(0, 96); // Max 96 caracteres
}

/**
 * Normaliza duración - MANTENER EN INGLÉS (el sitio es en inglés)
 */
function normalizeDuration(durationText) {
  if (!durationText) return '';
  
  // El sitio es en inglés - NO traducir
  // Simplemente limpiar y retornar el texto original
  return durationText.trim();
}

/**
 * Convierte URL de GetYourGuide a URL de afiliado LIMPIA
 * Remueve TODOS los parámetros existentes y agrega solo los de afiliado
 */
function toAffiliateUrl(url) {
  // Validaciones de seguridad
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  try {
    // Extraer SOLO la URL base sin ningún parámetro
    const baseUrl = url.split('?')[0];
    
    // Construir URL limpia con SOLO parámetros de afiliado
    const cleanUrl = `${baseUrl}?partner_id=2FVNDZG&utm_medium=online_publisher`;
    
    return cleanUrl;
    
  } catch (error) {
    console.warn('⚠️ Error convirtiendo a URL de afiliado:', error.message);
    return url;
  }
}

/**
 * Crea el documento del post en Sanity
 */
export async function createTourPost(tourData, generatedContent, uploadedImages) {
  console.log('\n📝 Creando post en Sanity...');
  
  if (config.dryRun) {
    console.log('🔶 DRY RUN MODE - No se creará el post realmente');
    console.log('\n📋 Preview del post que se crearía:');
    console.log('-----------------------------------');
    console.log(`Título: ${generatedContent.title}`);
    console.log(`SEO Title: ${generatedContent.seoTitle}`);
    console.log(`SEO Description: ${generatedContent.seoDescription}`);
    console.log(`Keywords: ${generatedContent.seoKeywords.join(', ')}`);
    console.log(`Ciudad: ${generatedContent.city}`);
    console.log(`Rating: ${tourData.rating}★ (${tourData.reviewCount} reviews)`);
    console.log(`Precio: $${tourData.price}`);
    console.log(`Duración: ${tourData.duration}`);
    console.log(`Idiomas: ${tourData.languages}`);
    console.log(`Imágenes: ${uploadedImages.length}`);
    console.log(`URL Original: ${tourData.url}`);
    console.log(`URL Afiliado: ${toAffiliateUrl(tourData.url)}`);
    console.log('-----------------------------------\n');
    
    return {
      success: true,
      dryRun: true,
      preview: {
        title: generatedContent.title,
        seoTitle: generatedContent.seoTitle,
        city: generatedContent.city
      }
    };
  }
  
  try {
    // Generar slug
    const slug = generateSlug(generatedContent.title);
    
    // Convertir contenido a Portable Text
    const portableTextBody = markdownToPortableText(generatedContent.body);
    
    // Generar URL de afiliado LIMPIA
    const affiliateUrl = toAffiliateUrl(tourData.url);
    
    // Normalizar duración (mantener en inglés)
    const durationNormalized = normalizeDuration(tourData.duration);
    
    console.log(`   🔗 Generando URL de afiliado...`);
    console.log(`   📍 URL original: ${tourData.url}`);
    console.log(`   ✅ URL limpia: ${affiliateUrl}`);
    
    // Construir documento
    const postDocument = {
      _type: 'post',
      
      // Básicos
      title: generatedContent.title,
      slug: {
        _type: 'slug',
        current: slug
      },
      
      // SEO
      seoTitle: generatedContent.seoTitle,
      seoDescription: generatedContent.seoDescription,
      seoKeywords: generatedContent.seoKeywords,
      seoImage: uploadedImages[0], // Primera imagen como SEO image

      // Imágenes
      heroGallery: uploadedImages.slice(0, 5), // Exactamente 5 imágenes (primera = principal)
      
      // Contenido
      body: portableTextBody,
      
      // Fecha
      publishedAt: new Date().toISOString(),
      
      // Tour Info (Schema.org) - EN INGLÉS
      tourInfo: {
        _type: 'object',
        duration: durationNormalized, // En inglés como debe ser
        price: tourData.price || 0,
        currency: 'USD',
        location: generatedContent.city,
        provider: 'scooterstour.com'
      },
      
      // Tour Features
      tourFeatures: {
        _type: 'object',
        freeCancellation: tourData.features.freeCancellation || false,
        skipTheLine: tourData.features.skipTheLine || false,
        wheelchairAccessible: tourData.features.wheelchairAccessible || false,
        smallGroupAvailable: tourData.features.smallGroup || false,
        hostGuide: tourData.languages || 'English',
        audioGuide: ''
      },
      
      // GetYourGuide Data
      getYourGuideData: {
        _type: 'object',
        rating: tourData.rating || 0,
        reviewCount: tourData.reviewCount || 0,
        lastUpdated: new Date().toISOString()
      },
      
      // URLs - CORREGIDAS
      getYourGuideUrl: tourData.url.split('?')[0], // URL original SIN parámetros
      bookingUrl: affiliateUrl // URL de afiliado limpia
    };
    
    // Crear documento en Sanity
    const result = await client.create(postDocument);
    
    console.log('✅ Post creado exitosamente en Sanity');
    console.log(`   ID: ${result._id}`);
    console.log(`   Título: ${result.title}`);
    console.log(`   Slug: ${result.slug.current}`);
    console.log(`   Duración: ${durationNormalized}`);
    console.log(`   Idiomas: ${tourData.languages}`);
    console.log(`   URL: ${config.siteUrl}/tour/${result.slug.current}`);
    console.log(`   🔗 Affiliate URL: ${affiliateUrl}`);
    
    return {
      success: true,
      postId: result._id,
      slug: result.slug.current,
      url: `${config.siteUrl}/tour/${result.slug.current}`
    };
    
  } catch (error) {
    console.error('❌ Error creando post en Sanity:', error.message);
    throw error;
  }
}

/**
 * Sube imágenes y crea el post completo
 */
export async function uploadToSanity(tourData, generatedContent, processedImages) {
  try {
    // Subir imágenes
    const uploadedImages = await uploadTourImages(processedImages);
    
    // Crear post
    const result = await createTourPost(tourData, generatedContent, uploadedImages);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error en proceso de upload:', error.message);
    throw error;
  }
}

/**
 * Convierte markdown a Portable Text con soporte para BOLD INLINE
 * Ahora procesa **texto** dentro de párrafos y FAQs correctamente
 */
function markdownToPortableText(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let currentParagraph = [];
  
  /**
   * Procesa una línea de texto y convierte **bold** a marks
   */
  const processInlineMarks = (text) => {
    const children = [];
    let lastIndex = 0;
    
    // Regex para encontrar **texto** (bold)
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Texto antes del bold
      if (match.index > lastIndex) {
        children.push({
          _type: 'span',
          _key: generateKey(),
          text: text.substring(lastIndex, match.index),
          marks: []
        });
      }
      
      // Texto en bold
      children.push({
        _type: 'span',
        _key: generateKey(),
        text: match[1],
        marks: ['strong']
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Texto después del último bold (o todo si no hay bold)
    if (lastIndex < text.length) {
      children.push({
        _type: 'span',
        _key: generateKey(),
        text: text.substring(lastIndex),
        marks: []
      });
    }
    
    // Si no hay children, retornar un span simple
    if (children.length === 0) {
      return [{
        _type: 'span',
        _key: generateKey(),
        text: text,
        marks: []
      }];
    }
    
    return children;
  };
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const fullText = currentParagraph.join(' ');
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: processInlineMarks(fullText),
        markDefs: []
      });
      currentParagraph = [];
    }
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Línea vacía = fin de párrafo
    if (!line) {
      flushParagraph();
      continue;
    }
    
    // H2
    if (line.startsWith('## ')) {
      flushParagraph();
      const text = line.replace('## ', '');
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'h2',
        children: [{
          _type: 'span',
          _key: generateKey(),
          text: text,
          marks: []
        }],
        markDefs: []
      });
      continue;
    }
    
    // H3
    if (line.startsWith('### ')) {
      flushParagraph();
      const text = line.replace('### ', '');
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'h3',
        children: [{
          _type: 'span',
          _key: generateKey(),
          text: text,
          marks: []
        }],
        markDefs: []
      });
      continue;
    }
    
    // Lista con bullets (-)
    if (line.startsWith('- ')) {
      flushParagraph();
      const text = line.replace('- ', '');
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        listItem: 'bullet',
        children: processInlineMarks(text),
        markDefs: []
      });
      continue;
    }
    
    // Blockquote (líneas que empiezan con ")
    if (line.startsWith('"') && line.endsWith('"')) {
      flushParagraph();
      const text = line.replace(/"/g, '');
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'blockquote',
        children: [{
          _type: 'span',
          _key: generateKey(),
          text: text,
          marks: []
        }],
        markDefs: []
      });
      continue;
    }
    
    // FAQ Question: **Q: pregunta?**
    // Debe estar en su propia línea con bold
    if (line.startsWith('**Q:') && line.includes('?**')) {
      flushParagraph();
      const text = line.replace(/^\*\*/, '').replace(/\*\*$/, ''); // Quitar ** del inicio y fin
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [{
          _type: 'span',
          _key: generateKey(),
          text: text,
          marks: ['strong']
        }],
        markDefs: []
      });
      continue;
    }
    
    // FAQ Answer: A: respuesta
    // Debe estar en su propia línea sin bold
    if (line.startsWith('A: ')) {
      flushParagraph();
      const text = line; // Mantener "A: " en el texto
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        children: [{
          _type: 'span',
          _key: generateKey(),
          text: text,
          marks: []
        }],
        markDefs: []
      });
      continue;
    }
    
    // Texto normal - acumular en párrafo actual
    currentParagraph.push(line);
  }
  
  // Flush último párrafo si existe
  flushParagraph();
  
  return blocks;
}

/**
 * Genera key única para Sanity
 */
function generateKey() {
  return Math.random().toString(36).substring(2, 11);
}