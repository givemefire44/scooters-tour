// category-content-generator.js
// Generador automático de contenido editorial para páginas de categorías

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@sanity/client';

// ========================================
// CONFIGURACIÓN
// ========================================
const config = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN,
    apiVersion: '2024-01-01'
  }
};

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey
});

const sanityClient = createClient({
  projectId: config.sanity.projectId,
  dataset: config.sanity.dataset,
  token: config.sanity.token,
  apiVersion: config.sanity.apiVersion,
  useCdn: false
});

// ========================================
// PROMPT TEMPLATE PARA CONTENIDO DE CIUDAD
// ========================================
const categoryContentPrompt = (cityData) => `
You are an expert travel content writer creating editorial content for ScootersTour.com category pages.

CITY: ${cityData.name}
COUNTRY: ${cityData.country || 'Unknown'}
KNOWN FOR: ${cityData.knownFor || 'Tourism'}
TOUR COUNT: ${cityData.tourCount || 'Multiple'} scooter tours available

YOUR TASK: Write compelling, SEO-optimized editorial content for the category page titled:
"Why Experience ${cityData.name} by Scooter"

CORE THEME - THE SCOOTER SENSATION:
The central message is that exploring a city by scooter creates a COMPLETELY DIFFERENT perception of the environment. Unlike being in a car (isolated, windows up) or walking (too slow, limited range), a scooter puts you IN the city:
- You feel the breeze, smell the food from trattorias, hear the conversations
- The city opens up differently - you notice details invisible from a car
- There's a sense of freedom and connection that's impossible to replicate
- You become part of the urban flow, not just an observer

CONTENT STRUCTURE (400-600 words total):

### Opening Paragraph (The Sensation)
Start with an immersive description of the UNIQUE SENSATION of exploring ${cityData.name} by scooter.
- How the perception of the city transforms when you're on a scooter
- Sensory immersion: wind, sounds, smells, temperature, atmosphere
- The emotional freedom and connection with the environment
- Make readers FEEL what it's like
- 3-4 sentences

### What Makes ${cityData.name} Perfect for Scooter Tours  
Explain WHY scooters unlock ${cityData.name} in ways other transport can't:
- Terrain and urban layout that favors two wheels
- How scooters let you experience transitions between neighborhoods
- The sweet spot between walking (too slow) and cars (too isolated)
- Cultural context: how locals move around
- 4-5 sentences

### Best Areas to Explore
Highlight 3-4 iconic areas and how they FEEL different by scooter:
- Specific districts/neighborhoods
- Sensory details unique to each area
- Routes that reveal the city's character
- Hidden gems only accessible by scooter
- 4-5 sentences

### Practical Insights
Expert tips for the best scooter experience:
- Best times to ride (light, traffic, atmosphere)
- What to expect from local traffic culture
- Weather and seasonal considerations
- 3-4 sentences

FORMATTING RULES:
1. Use **bold text** for 3-5 key phrases per paragraph (important concepts, place names, sensory words)
2. Start ONLY the first paragraph with a thematic emoji (🛵)
3. Start ONLY the third paragraph (Best Areas) with 🏛️
4. NO other emojis - keep it professional
5. Write in flowing prose paragraphs separated by blank lines
6. NO headers, NO bullets, NO lists
7. Use second person ("you'll feel", "you discover")

TONE: 
- Enthusiastic expert who has actually ridden scooters in ${cityData.name}
- Focus on the TRANSFORMATIVE SENSATION of scooter exploration
- Evocative but not over-the-top
- Make readers feel the experience through words

LENGTH: 400-600 words total (important - don't exceed 600 words)

Start writing now:
`;

// ========================================
// GENERADOR DE CONTENIDO
// ========================================
async function generateCategoryContent(cityData) {
  console.log(`\n📝 Generando contenido para: ${cityData.name}...`);
  
  try {
    const prompt = categoryContentPrompt(cityData);
    
    console.log('⏳ Esperando respuesta de Claude...');
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    const content = message.content[0].text.trim();
    
    console.log('✅ Contenido generado exitosamente');
    console.log(`   Tokens usados: ${message.usage.input_tokens + message.usage.output_tokens}`);
    console.log(`   Caracteres: ${content.length}`);
    
    return content;
    
  } catch (error) {
    console.error('❌ Error generando contenido:', error.message);
    throw error;
  }
}

// ========================================
// ACTUALIZAR CATEGORÍA EN SANITY
// ========================================
async function updateCategoryInSanity(categorySlug, content, editorialTitle) {
  console.log(`\n📤 Actualizando categoría en Sanity: ${categorySlug}...`);
  
  try {
    // Buscar la categoría por slug
    const query = `*[_type == "category" && slug.current == $slug][0]`;
    const category = await sanityClient.fetch(query, { slug: categorySlug });
    
    if (!category) {
      throw new Error(`Categoría no encontrada: ${categorySlug}`);
    }
    
    // Actualizar longDescription y editorialTitle
    await sanityClient
      .patch(category._id)
      .set({ 
        longDescription: content,
        editorialTitle: editorialTitle
      })
      .commit();
    
    console.log('✅ Categoría actualizada en Sanity');
    console.log(`   ID: ${category._id}`);
    console.log(`   Slug: ${categorySlug}`);
    console.log(`   Título: ${editorialTitle}`);
    
    return {
      success: true,
      categoryId: category._id,
      slug: categorySlug
    };
    
  } catch (error) {
    console.error('❌ Error actualizando Sanity:', error.message);
    throw error;
  }
}

// ========================================
// PROCESO COMPLETO
// ========================================
async function generateAndUpdateCategory(cityData, categorySlug) {
  try {
    console.log('\n🚀 Iniciando generación de contenido de categoría...');
    console.log(`   Ciudad: ${cityData.name}`);
    console.log(`   Slug: ${categorySlug}`);
    
    // Generar contenido
    const content = await generateCategoryContent(cityData);
    
    // Mostrar preview
    console.log('\n📋 PREVIEW DEL CONTENIDO:');
    console.log('─'.repeat(60));
    console.log(content.substring(0, 300) + '...');
    console.log('─'.repeat(60));
    
    // Actualizar en Sanity (con título)
    const result = await updateCategoryInSanity(categorySlug, content, cityData.editorialTitle);
    
    console.log('\n✅ PROCESO COMPLETADO EXITOSAMENTE');
    console.log(`   URL: https://scooterstour.com/tours/${categorySlug}`);
    
    return result;
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL PROCESO:', error.message);
    throw error;
  }
}

// ========================================
// BATCH PROCESSING - Generar para múltiples ciudades
// ========================================
async function generateBatchCategories(cities) {
  console.log(`\n🔄 Procesando ${cities.length} ciudades...`);
  
  const results = [];
  
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    console.log(`\n[${i + 1}/${cities.length}] Procesando: ${city.name}`);
    
    try {
      const result = await generateAndUpdateCategory(city.data, city.slug);
      results.push({ city: city.name, success: true, ...result });
      
      // Esperar 2 segundos entre requests para no saturar la API
      if (i < cities.length - 1) {
        console.log('⏸️  Esperando 2 segundos...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      results.push({ city: city.name, success: false, error: error.message });
    }
  }
  
  // Resumen final
  console.log('\n📊 RESUMEN DEL BATCH:');
  console.log('─'.repeat(60));
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Exitosos: ${successful}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log('─'.repeat(60));
  
  return results;
}

// ========================================
// EXPORTAR FUNCIONES
// ========================================
export {
  generateCategoryContent,
  updateCategoryInSanity,
  generateAndUpdateCategory,
  generateBatchCategories
};