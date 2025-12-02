// src/scraper.js
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { config } from '../config.js';

// Aplicar plugin stealth
puppeteer.use(StealthPlugin());

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Delay aleatorio entre min y max ms
const randomDelay = (min, max) => delay(min + Math.random() * (max - min));

/**
 * 🧹 Limpia la URL de afiliado dejando solo parámetros esenciales
 */
export function cleanAffiliateUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Mantener solo parámetros esenciales de afiliado
    const essentialParams = ['partner_id', 'utm_medium', 'utm_source', 'utm_campaign'];
    
    // Crear nueva URL limpia
    const cleanUrl = new URL(urlObj.origin + urlObj.pathname);
    
    // Agregar solo parámetros esenciales que existan
    essentialParams.forEach(param => {
      const value = urlObj.searchParams.get(param);
      if (value) {
        cleanUrl.searchParams.set(param, value);
      }
    });
    
    return cleanUrl.toString();
  } catch (error) {
    console.warn('⚠️ Error limpiando URL, usando original:', error.message);
    return url;
  }
}

export async function scrapeGetYourGuideTour(url) {
  console.log('\n🔍 Iniciando scraping de GetYourGuide...');
  console.log(`📍 URL: ${url}`);
  
  let browser;
  
  try {
    // Lanzar navegador con stealth
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ],
      ignoreHTTPSErrors: true
    });
    
    const page = await browser.newPage();
    
    // Viewport realista
    await page.setViewport({ 
      width: 1920, 
      height: 1080,
      deviceScaleFactor: 1
    });
    
    // User agent realista
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Headers adicionales
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    });
    
    console.log('⏳ Navegando a la página...');
    
    // Navegar con timeout extendido
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 90000 
    });
    
    // Delay para que cargue completamente
    console.log('⏳ Esperando carga completa...');
    await randomDelay(3000, 5000);
    
    // Esperar a que cargue el contenido principal
    await page.waitForSelector('h1', { timeout: 15000 });
    
    console.log('✅ Página cargada');
    
    // Scroll lento como humano
    console.log('📜 Scrolleando página...');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          if(totalHeight >= scrollHeight / 2){
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    
    await randomDelay(1000, 2000);

    // 🖼️ ABRIR GALERÍA LIGHTBOX - CRUCIAL PARA OBTENER IMÁGENES
console.log('🖼️ Intentando abrir galería de imágenes...');
try {
  // Buscar y hacer click en la imagen principal para abrir lightbox
  const mainImageSelectors = [
    'img.c-image__img',
    '[class*="hero"] img',
    '[class*="main-image"] img',
    'img[alt*="image n.1"]',
  ];
  
  let galleryOpened = false;
  
  for (const selector of mainImageSelectors) {
    try {
      const mainImage = await page.$(selector);
      if (mainImage) {
        console.log(`   Haciendo click en imagen: ${selector}`);
        await mainImage.click();
        await randomDelay(2000, 3000); // Esperar a que abra el modal
        
        // Verificar si se abrió el lightbox
        const lightbox = await page.$('[class*="lightbox"], [class*="swiper"]');
        if (lightbox) {
          console.log('   ✅ Lightbox de galería abierto');
          galleryOpened = true;
          break;
        }
      }
    } catch (e) {
      // Probar siguiente selector
    }
  }
  
  if (!galleryOpened) {
    console.log('   ⚠️ No se pudo abrir galería, usando imágenes de página principal');
  }
} catch (e) {
  console.log('   ⚠️ Error abriendo galería:', e.message);
}
    
    // Click en "Show more" si existe (para expandir descripción completa)
    try {
      const showMoreButtons = await page.$$('button.toggle-content__button, button.toggle-content__label');
      for (const button of showMoreButtons) {
        try {
          await button.click();
          await randomDelay(500, 1000);
        } catch (e) {
          // Ignorar si el botón no es clickeable
        }
      }
      console.log('📖 Contenido expandido');
    } catch (e) {
      console.log('ℹ️ No se encontraron botones para expandir');
    }
    
    // Extraer todos los datos
    console.log('📊 Extrayendo datos del tour...');
    const tourData = await page.evaluate(() => {
      // Helper para extraer texto limpio
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : '';
      };
      
      const getTextAll = (selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => el.innerText.trim());
      };
      
      // Extraer título
      const title = getText('h1');
      
      // Extraer rating y reviews
      let rating = 0;
      let reviewCount = 0;
      
      const bodyText = document.body.innerText;
      const ratingMatch = bodyText.match(/(\d+\.?\d*)\s*out of 5/i);
      if (ratingMatch) rating = parseFloat(ratingMatch[1]);
      
      const reviewMatch = bodyText.match(/(\d+[\d,]*)\s*reviews/i);
      if (reviewMatch) reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
      
// Extraer precio
let price = 0;

// 1️⃣ PRIORIDAD: Precio con descuento (--label-discounted)
const discountedPrice = document.querySelector('[style*="--label-discounted"]');
if (discountedPrice) {
  const priceText = discountedPrice.innerText;
  const priceMatch = priceText.match(/\$(\d+[\d,]*)/);
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(/,/g, ''));
  }
}

// 2️⃣ FALLBACK: Si no hay descuento, buscar precio normal
if (price === 0) {
  const priceElements = document.querySelectorAll('[class*="price"], [data-test-id*="price"]');
  for (const el of priceElements) {
    // ❌ IGNORAR precios dentro de <del> o con "From"
    if (el.closest('del') || el.closest('.price-info__from-base-price')) {
      continue;
    }
    
    const priceText = el.innerText;
    const priceMatch = priceText.match(/\$(\d+[\d,]*)/);
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/,/g, ''));
      break;
    }
  }
}
      
      // Extraer duración
      let duration = '';
      const durationMeta = document.querySelector('meta[property="product:duration"]') ||
                           document.querySelector('meta[itemprop="duration"]');
      if (durationMeta) {
        duration = durationMeta.content;
      }
      
      if (!duration) {
        const durationMatch = bodyText.match(/Duration[:\s]+(\d+\.?\d*(?:\s*-\s*\d+\.?\d*)?\s*hours?)/i);
        if (durationMatch) {
          duration = durationMatch[1].trim();
        }
      }
      
      // Extraer descripción - SELECTOR EXACTO
      const description = getText('[data-test-id="single-text"]');
      
// Extraer highlights - SELECTOR EXACTO (solo del bloque highlights-point)
const highlights = Array.from(document.querySelectorAll('#highlights-point [data-test-id="text-list-block-list"] li'))
  .map(li => li.innerText.trim())
  .filter(text => text.length > 0);
      
      // Extraer includes - SELECTOR EXACTO
      const includes = Array.from(document.querySelectorAll('[id^="inclusion-"][id$="-title-text"]'))
        .map(el => el.innerText.trim())
        .filter(text => text.length > 0);
      
      // Extraer idiomas
      let languages = 'English';
      try {
        const langMatch = bodyText.match(/(?:Languages?|Live tour guide|Guide)(?::|\s)+([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*)/i);
        if (langMatch) {
          languages = langMatch[1].trim();
        }
      } catch (e) {
        languages = 'English';
      }

      // Extraer provider - SELECTOR EXACTO
     const provider = getText('[id="activity-provider-description-title"]').replace('Activity provider: ', '').trim();
      
// 🔥 EXTRACCIÓN DE IMÁGENES - DESDE LIGHTBOX/GALERÍA
const images = [];
const processedUrls = new Set();

// 🎯 PRIORIDAD 1: Buscar en el lightbox/swiper (galería abierta)
const lightboxImages = document.querySelectorAll(
  '.media-lightbox-swiper-embed img, ' +
  '.swiper-slide img, ' +
  '[class*="lightbox"] img'
);

console.log(`📸 Imágenes en lightbox: ${lightboxImages.length}`);

// Si encontró imágenes en el lightbox, usarlas
const imagesToProcess = lightboxImages.length > 0 
  ? lightboxImages 
  : document.querySelectorAll('img[src*="tour_img"], img[srcset*="tour_img"]');

console.log(`📸 Procesando ${imagesToProcess.length} imágenes`);

for (const img of Array.from(imagesToProcess).slice(0, 15)) {
  let imageUrl = null;
  
  // 🎯 PRIORIDAD 1: Buscar en srcset (versiones grandes)
  if (img.srcset && img.srcset.includes('tour_img')) {
    const srcsetParts = img.srcset.match(/(https:\/\/[^\s]+)\s+\d+x/gi);
    if (srcsetParts && srcsetParts.length > 0) {
      // Tomar la última (mayor resolución: dpr=2)
      imageUrl = srcsetParts[srcsetParts.length - 1].replace(/\s+\d+x$/i, '');
    }
  }
  
  // FALLBACK: src normal
  if (!imageUrl) {
    imageUrl = img.src || img.dataset.src || img.dataset.lazySrc;
  }
  
  if (!imageUrl || !imageUrl.includes('tour_img')) continue;
  
  // ✅ Usar URL completa sin modificar
  if (!processedUrls.has(imageUrl)) {
    processedUrls.add(imageUrl);
    images.push({
      url: imageUrl,
      baseUrl: imageUrl,
      width: img.naturalWidth || 0,
      height: img.naturalHeight || 0
    });
  }
}

// Filtrado final
const filteredImages = images
  .filter(img => {
    if (img.width > 0 && img.height > 0) {
      if (img.width < 400) return false;
      return true;
    }
    return true;
  })
  .slice(0, 6)
  .map(img => img.url);

console.log(`✅ Imágenes seleccionadas: ${filteredImages.length}`);
      
      // Extraer reviews - SELECTOR EXACTO
      const reviewQuotes = Array.from(document.querySelectorAll('.review-highlight-card__text'))
        .map(p => p.innerText.trim())
        .filter(text => text.length > 20)
        .slice(0, 5);
      
      // Detectar features
      const fullText = document.body.innerText.toLowerCase();
      const features = {
        freeCancellation: fullText.includes('free cancellation'),
        skipTheLine: fullText.includes('skip the line') || fullText.includes('skip-the-line'),
        smallGroup: fullText.includes('small group') || fullText.includes('limited to'),
        wheelchairAccessible: fullText.includes('wheelchair accessible'),
        liveGuide: fullText.includes('live guide') || fullText.includes('tour guide')
      };
      
      return {
        title,
        rating,
        reviewCount,
        price,
        duration,
        description,
        highlights,
        includes,
        languages,
        provider,  // ← NUEVO
        images: filteredImages,
        reviewQuotes,
        features,
        url: window.location.href
      };
    });
    
    console.log('✅ Datos extraídos exitosamente');
    console.log(`   Título: ${tourData.title}`);
    console.log(`   Rating: ${tourData.rating}★ (${tourData.reviewCount} reviews)`);
    console.log(`   Precio: $${tourData.price}`);
    console.log(`   Duración: ${tourData.duration}`);
    console.log(`   Descripción: ${tourData.description.substring(0, 100)}...`);
    console.log(`   Highlights: ${tourData.highlights.length} items`);
    console.log(`   Includes: ${tourData.includes.length} items`);
    console.log(`   Reviews: ${tourData.reviewQuotes.length} items`);
    console.log(`   Idiomas: ${tourData.languages}`);
    console.log(`   Imágenes: ${tourData.images.length}`);
    
    return tourData;
    
  } catch (error) {
    console.error('❌ Error en scraping:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
    
    // Rate limiting
    console.log(`⏱️ Esperando ${config.scraper.rateLimitMs / 1000}s (rate limit)...`);
    await delay(config.scraper.rateLimitMs);
  }
}