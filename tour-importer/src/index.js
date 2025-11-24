// src/index.js
import { scrapeGetYourGuideTour, cleanAffiliateUrl } from './scraper.js';
import { processImages, cleanupTempFiles } from './imageProcessor.js';
import { generateTourContent } from './contentGenerator.js';
import { uploadToSanity } from './sanityUploader.js';
import { config } from '../config.js';

/**
 * Script principal - Orquestador del proceso completo
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     🛵 SCOOTERSTOUR - TOUR IMPORTER v1.0 🛵           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  // Obtener URL del tour desde argumentos
  const tourUrl = process.argv[2];
  
  if (!tourUrl) {
    console.error('❌ Error: Debes proporcionar una URL de GetYourGuide\n');
    console.log('Uso:');
    console.log('  node src/index.js <URL_DE_GETYOURGUIDE>\n');
    console.log('Ejemplo:');
    console.log('  node src/index.js https://www.getyourguide.com/rome-l33/vespa-tour-t12345\n');
    process.exit(1);
  }
  
  if (!tourUrl.includes('getyourguide.com')) {
    console.error('❌ Error: La URL debe ser de GetYourGuide\n');
    process.exit(1);
  }
  
  console.log(`🎯 Modo: ${config.dryRun ? 'DRY RUN (prueba sin crear)' : 'PRODUCCIÓN'}`);
  console.log(`📍 URL: ${tourUrl}\n`);
  
  const startTime = Date.now();
  
  try {
    // ========================================
    // PASO 1: SCRAPING
    // ========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 PASO 1/5: EXTRAYENDO DATOS DE GETYOURGUIDE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const tourData = await scrapeGetYourGuideTour(tourUrl);
    
    if (!tourData.title) {
      throw new Error('No se pudo extraer el título del tour');
    }
    
    if (tourData.images.length === 0) {
      throw new Error('No se encontraron imágenes para el tour');
    }
    
 // 🔗 Construir y limpiar URL de afiliado
console.log('🔗 Generando URL de afiliado limpia...');

// Extraer solo la URL base sin parámetros
const baseUrl = tourData.url.split('?')[0];

// Construir URL limpia con nuestros parámetros
const rawBookingUrl = `${baseUrl}?partner_id=${config.affiliate.partnerId}&utm_medium=${config.affiliate.utmMedium}`;
const cleanBookingUrl = cleanAffiliateUrl(rawBookingUrl);

// Agregar URL limpia al tourData
tourData.bookingUrl = cleanBookingUrl;

console.log(`✅ URL de afiliado: ${cleanBookingUrl}`);
    
    // ========================================
    // PASO 2: PROCESAMIENTO DE IMÁGENES
    // ========================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🖼️  PASO 2/5: PROCESANDO IMÁGENES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Tomar máximo 5 imágenes
    const imageUrls = tourData.images.slice(0, 5);
    const processedImages = await processImages(imageUrls);
    
    if (processedImages.length < 5) {
      console.warn(`⚠️ Solo se procesaron ${processedImages.length} de 5 imágenes requeridas`);
    }
    
    // ========================================
    // PASO 3: GENERACIÓN DE CONTENIDO
    // ========================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✍️  PASO 3/5: GENERANDO CONTENIDO CON CLAUDE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const generatedContent = await generateTourContent(tourData);
    
    // ========================================
    // PASO 4: SUBIDA A SANITY
    // ========================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('☁️  PASO 4/5: SUBIENDO A SANITY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const result = await uploadToSanity(tourData, generatedContent, processedImages);
    
    // ========================================
    // PASO 5: LIMPIEZA
    // ========================================
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧹 PASO 5/5: LIMPIEZA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    cleanupTempFiles();
    
    // ========================================
    // RESULTADO FINAL
    // ========================================
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ COMPLETADO                       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 RESUMEN:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`✅ Título: ${generatedContent.title}`);
    console.log(`✅ Ciudad: ${generatedContent.city}`);
    console.log(`✅ Rating: ${tourData.rating}★ (${tourData.reviewCount} reviews)`);
    console.log(`✅ Precio: $${tourData.price}`);
    console.log(`✅ Duración: ${tourData.duration}`);
    console.log(`✅ Imágenes procesadas: ${processedImages.length}`);
    console.log(`✅ SEO Title: ${generatedContent.seoTitle}`);
    console.log(`✅ Keywords: ${generatedContent.seoKeywords.join(', ')}`);
    console.log(`✅ Booking URL: ${tourData.bookingUrl}`);
    
    if (!config.dryRun) {
      console.log(`\n🔗 URL del post: ${result.url}`);
      console.log(`📝 ID en Sanity: ${result.postId}`);
      console.log(`\n⚠️  ACCIÓN REQUERIDA:`);
      console.log(`   1. Abrí Sanity Studio`);
      console.log(`   2. Buscá el post: "${generatedContent.title}"`);
      console.log(`   3. Seleccioná la categoría/ciudad manualmente`);
      console.log(`   4. Revisá el contenido`);
      console.log(`   5. ¡Publish!`);
    } else {
      console.log(`\n🔶 DRY RUN: No se creó ningún post en Sanity`);
      console.log(`   Para crear el post realmente, cambiá DRY_RUN=false en .env.local`);
    }
    
    console.log(`\n⏱️  Tiempo total: ${duration}s`);
    console.log('─────────────────────────────────────────────────────────\n');
    
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════════════╗');
    console.error('║                    ❌ ERROR                            ║');
    console.error('╚════════════════════════════════════════════════════════╝\n');
    console.error('💥 Error durante el proceso:');
    console.error(`   ${error.message}\n`);
    
    if (error.stack) {
      console.error('📚 Stack trace:');
      console.error(error.stack);
    }
    
    // Limpiar archivos temporales incluso si hay error
    try {
      cleanupTempFiles();
    } catch (cleanupError) {
      // Ignorar errores de limpieza
    }
    
    process.exit(1);
  }
}

// Ejecutar
main();