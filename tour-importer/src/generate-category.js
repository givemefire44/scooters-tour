// generate-category.js
// Script dinámico - busca la categoría en Sanity

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@sanity/client';
import { generateAndUpdateCategory } from './category-content-generator.js';

// ========================================
// CONFIGURACIÓN SANITY
// ========================================
const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false
});

// ========================================
// LIMPIAR NOMBRE DE CIUDAD
// ========================================
function cleanCityName(title) {
  let clean = title
    .replace(/:.*$/, '')                          // Quitar todo después de ":"
    .replace(/\s*(Vespa|Scooter)\s*Tours?/gi, '') // Quitar "Vespa Tours", etc.
    .trim();
  
  return clean;
}

// ========================================
// DETERMINAR TIPO DE VEHÍCULO
// ========================================
function getVehicleType(cityName) {
  const italianCities = /rome|roma|florence|firenze|milan|milano|naples|napoli|venice|venezia|sicily|sicilia|tuscany|toscana|amalfi|positano|sorrento|ravello|siena|lucca|pisa|bologna|verona|modena|parma|torino|turin|genova|como|sardinia|sardegna|puglia|lecce|bari|perugia|umbria|chianti|san gimignano|cinque terre|capri|taormina|palermo|catania/i;
  
  return italianCities.test(cityName) ? 'Vespa' : 'Scooter';
}

// ========================================
// OBTENER CATEGORÍA DE SANITY
// ========================================
async function getCategoryFromSanity(slug) {
  const query = `*[_type == "category" && slug.current == $slug][0]{
    title,
    description,
    "tourCount": count(*[_type == "post" && references(^._id)])
  }`;
  
  return await sanityClient.fetch(query, { slug });
}

// ========================================
// EJECUTAR
// ========================================
const slug = process.argv[2];

if (!slug) {
  console.log('❌ Error: Falta el slug de la categoría\n');
  console.log('Uso: node src/generate-category.js <slug>\n');
  console.log('Ejemplo: node src/generate-category.js positano');
  process.exit(1);
}

console.log('🚀 Generador de Contenido de Categorías');
console.log('==========================================\n');

// Buscar categoría en Sanity
console.log(`🔍 Buscando categoría "${slug}" en Sanity...`);

getCategoryFromSanity(slug)
  .then(category => {
    if (!category) {
      console.log(`❌ Error: Categoría "${slug}" no encontrada en Sanity`);
      process.exit(1);
    }
    
    console.log(`✅ Encontrada: ${category.title}`);
    console.log(`   Tours vinculados: ${category.tourCount || 0}\n`);
    
    const cleanName = cleanCityName(category.title);
    const vehicleType = getVehicleType(cleanName);
    const editorialTitle = `Why You Should Take a ${vehicleType} Tour in ${cleanName}`;
    
    console.log(`   Nombre limpio: ${cleanName}`);
    console.log(`   Título editorial: ${editorialTitle}\n`);
    
    // Armar cityData desde Sanity
    const cityData = {
      name: cleanName,
      country: 'Italy',
      knownFor: category.description || 'Scooter and Vespa tours',
      tourCount: category.tourCount || 0,
      editorialTitle: editorialTitle
    };
    
    return generateAndUpdateCategory(cityData, slug);
  })
  .then(() => {
    console.log('\n✅ ¡TODO COMPLETADO!');
    console.log(`\n🌐 Verificá en: https://scooterstour.com/tours/${slug}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ ERROR FATAL:', error);
    process.exit(1);
  });