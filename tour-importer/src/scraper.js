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
    
    // Click en "Show more" si existe
    try {
      const showMoreButton = await page.$('[data-test-id="activity-description-read-more-button"]');
      if (showMoreButton) {
        console.log('📖 Expandiendo descripción completa...');
        await showMoreButton.click();
        await randomDelay(1000, 2000);
      }
    } catch (e) {
      console.log('ℹ️ No se encontró botón "Show more"');
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
      
      const ratingText = document.body.innerText;
      const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*out of 5/i);
      if (ratingMatch) rating = parseFloat(ratingMatch[1]);
      
      const reviewMatch = ratingText.match(/(\d+[\d,]*)\s*reviews/i);
      if (reviewMatch) reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
      
      // Extraer precio
      let price = 0;
      const priceElements = document.querySelectorAll('[class*="price"], [data-test-id*="price"]');
      for (const el of priceElements) {
        const priceText = el.innerText;
        const priceMatch = priceText.match(/\$(\d+[\d,]*)/);
        if (priceMatch) {
          price = parseFloat(priceMatch[1].replace(/,/g, ''));
          break;
        }
      }
      
      // Extraer duración
      let duration = '';
      const durationElements = document.querySelectorAll('[class*="duration"]');
      for (const el of durationElements) {
        if (el.innerText.includes('hour') || el.innerText.includes('minute')) {
          duration = el.innerText.trim();
          break;
        }
      }
      
      // Extraer descripción completa
      const descriptionElement = document.querySelector('[data-test-id="activity-description"]') ||
                                 document.querySelector('[class*="description"]');
      const description = descriptionElement ? descriptionElement.innerText.trim() : '';
      
      // Extraer highlights
      const highlights = getTextAll('[data-test-id="activity-highlight"]');
      
      // Extraer includes
      let includes = [];
      const includesHeading = Array.from(document.querySelectorAll('h2, h3, strong'))
        .find(el => el.innerText.toLowerCase().includes('include'));
      if (includesHeading) {
        const parent = includesHeading.closest('section') || includesHeading.parentElement;
        const listItems = parent.querySelectorAll('li');
        includes = Array.from(listItems).map(li => li.innerText.trim());
      }
      
      // Extraer idiomas (CORREGIDO)
      let languages = 'English';
      try {
        const languageText = document.body.innerText;
        const langMatch = languageText.match(/(?:Languages?|Live tour guide|Guide)(?::|\s)+([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*)/i);
        if (langMatch) {
          languages = langMatch[1].trim();
        }
      } catch (e) {
        languages = 'English';
      }
      
      // 🔥 EXTRACCIÓN MEJORADA DE IMÁGENES - CON FILTROS INTELIGENTES
      const images = [];
      const processedUrls = new Set();
      
      // Estrategia 1: Buscar galería de imágenes
      const galleryImages = document.querySelectorAll('[class*="gallery"] img, [class*="Gallery"] img, [data-test-id*="image"] img');
      
      console.log(`📸 Encontradas ${galleryImages.length} imágenes candidatas en galería`);
      
      for (const img of galleryImages) {
        let imageUrl = img.src || img.dataset.src || img.dataset.lazySrc;
        
        if (imageUrl && imageUrl.includes('getyourguide')) {
          const baseUrl = imageUrl.split('?')[0];
          
          // ✅ Tamaño óptimo: 1600px (sweet spot calidad/disponibilidad)
          const optimizedUrl = `${baseUrl}?w=1600&q=90`;
          
          if (!processedUrls.has(baseUrl)) {
            processedUrls.add(baseUrl);
            images.push({
              url: optimizedUrl,
              baseUrl: baseUrl,
              width: img.naturalWidth || 0,
              height: img.naturalHeight || 0
            });
          }
        }
      }
      
      // Estrategia 2: Si no hay suficientes, buscar en srcset
      if (images.length < 8) {
        const allImages = document.querySelectorAll('img[srcset]');
        for (const img of allImages) {
          const srcset = img.srcset;
          if (srcset && srcset.includes('getyourguide')) {
            const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
            const baseUrl = urls[urls.length - 1].split('?')[0];
            
            if (!processedUrls.has(baseUrl)) {
              processedUrls.add(baseUrl);
              images.push({
                url: `${baseUrl}?w=1600&q=90`,
                baseUrl: baseUrl,
                width: img.naturalWidth || 0,
                height: img.naturalHeight || 0
              });
            }
          }
          
          if (images.length >= 10) break;
        }
      }
      
      // 🔥 FILTRADO INTELIGENTE - Priorizar mejores imágenes
      const filteredImages = images
        .filter(img => {
          // Si tenemos dimensiones, filtrar
          if (img.width > 0 && img.height > 0) {
            // Mínimo 600px de ancho (flexible)
            if (img.width < 600) return false;
            
            // Evitar imágenes muy verticales (portraits extremos)
            const aspectRatio = img.width / img.height;
            if (aspectRatio < 0.6) return false; // Muy vertical
            
            return true;
          }
          // Si no hay dimensiones, aceptar (verificaremos después)
          return true;
        })
        .slice(0, 6) // Tomar 6 mejores para tener margen
        .map(img => img.url);
      
      console.log(`✅ Imágenes tras filtrado: ${filteredImages.length} de ${images.length} candidatas`);
      
      // Extraer reviews (quotes)
      const reviewQuotes = [];
      const reviewElements = document.querySelectorAll('[data-test-id*="review"]');
      for (const el of reviewElements) {
        const text = el.innerText.trim();
        if (text.length > 20 && text.length < 200) {
          reviewQuotes.push(text);
        }
        if (reviewQuotes.length >= 3) break;
      }
      
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
        images: filteredImages, // ✅ Usar imágenes filtradas
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
    console.log(`   Idiomas: ${tourData.languages}`);
    console.log(`   Imágenes encontradas: ${tourData.images.length}`);
    
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