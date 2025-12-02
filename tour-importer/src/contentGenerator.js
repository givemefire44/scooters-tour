// src/contentGenerator.js
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';
import { promptBuilder } from '../templates/post-template.js';

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey
});

/**
 * 🔧 NORMALIZA Quick Info - Elimina "From" del precio
 */
function normalizeQuickInfo(content) {
  console.log('🔧 Normalizando Quick Info...');
  
  let normalized = content;
  
  // Eliminar "From" antes del precio si existe
  normalized = normalized.replace(/💰\s+(From\s+)?\$/gi, '💰 $');
  
  // Si encuentra Quick Info con negrita, quitarla
  // Patrón: **⭐...👥...**
  normalized = normalized.replace(/^\*\*([⏱️👥💰⭐].*[⏱️👥💰⭐].*)\*\*$/gm, '$1');
  
  console.log('✅ Quick Info normalizado - sin "From" y sin negrita');
  
  return normalized;
}

/**
 * 🔧 NORMALIZA "By the Numbers" - Pone labels en negrita
 */
function normalizeByTheNumbers(content) {
  console.log('🔧 Normalizando "By the Numbers"...');
  
  let normalized = content;
  
  // Detectar sección "By the Numbers"
  const byTheNumbersRegex = /(###\s*📊\s*By the Numbers[\s\S]*?)(?=###|$)/;
  const match = normalized.match(byTheNumbersRegex);
  
  if (match) {
    let section = match[1];
    
    // Patrón: emoji + espacio + texto + : + valor
    // Convertir: 🕐 Duration: 2.5 hours → 🕐 **Duration:** 2.5 hours
    section = section.replace(/([🕐👥💰⭐📝📍🛵🗣️♿🎭])\s+([^:]+):/g, '$1 **$2:**');
    
    // Limpiar dobles negritas si ya estaban: **Duration:** → **Duration:**
    section = section.replace(/\*\*\*\*([^:]+):\*\*\*\*/g, '**$1:**');
    
    normalized = normalized.replace(byTheNumbersRegex, section);
    console.log('✅ "By the Numbers" normalizado - labels en negrita');
  }
  
  return normalized;
}

/**
 * 🔧 NORMALIZA FAQs - Corrige formato de preguntas mal formateadas
 */
function normalizeFAQs(content) {
  console.log('🔧 Normalizando formato de FAQs...');
  
  let normalized = content;
  
  // 1. Detectar bloque de FAQs (después de ### ❓ Frequently Asked Questions)
  const faqSectionRegex = /(###\s*❓\s*Frequently Asked Questions[\s\S]*?)(?=###|$)/;
  const faqMatch = normalized.match(faqSectionRegex);
  
  if (faqMatch) {
    let faqSection = faqMatch[1];
    
    // 2. Corregir FAQs individuales que faltan el ** de cierre
    // Patrón: **Q: texto? (sin ** al final antes de salto de línea)
    faqSection = faqSection.replace(/\*\*Q:\s*([^?]+\?)\s*(?!\*\*)/gm, '**Q: $1**');
    
    // 3. Asegurar que A: esté en nueva línea después de **
    // Patrón: ?** A: o ?**A:
    faqSection = faqSection.replace(/\?\*\*\s*A:/g, '?**\nA:');
    
    // 4. Si detectamos un bloque mal formado con múltiples Q sin ** individuales
    // Patrón: **Q: pregunta1?\nA: respuesta\nQ: pregunta2?
    // Convertir a: **Q: pregunta1?**\nA: respuesta\n**Q: pregunta2?**
    faqSection = faqSection.replace(/([^\*])Q:\s*([^?]+\?)/g, '$1**Q: $2**');
    
    // 5. Limpiar dobles asteriscos duplicados ****Q: -> **Q:
    faqSection = faqSection.replace(/\*{3,}Q:/g, '**Q:');
    
    // 6. Limpiar cierres duplicados ?****  -> ?**
    faqSection = faqSection.replace(/\?\*{3,}/g, '?**');
    
    // 7. Si la primera Q no tiene ** al inicio (caso extremo)
    faqSection = faqSection.replace(/^Q:\s*([^?]+\?)/gm, '**Q: $1**');
    
    // Reemplazar sección de FAQs corregida
    normalized = normalized.replace(faqSectionRegex, faqSection);
    
    console.log('✅ FAQs normalizadas - cada pregunta tiene **Q: pregunta?** formato');
  } else {
    console.log('⚠️ No se encontró sección de FAQs en el contenido');
  }
  
  return normalized;
}

/**
 * 🧹 LIMPIA CONTENIDO GENERADO - Elimina asteriscos EXCEPTO en FAQs y corrige formato
 */
function cleanGeneratedContent(content) {
  console.log('🧹 Limpiando formato del contenido...');
  
  let cleaned = content;
  
  // PASO 1: Normalizar FAQs PRIMERO (antes de eliminar otros asteriscos)
  //cleaned = normalizeFAQs(cleaned);
  
  // PASO 1.5: Normalizar Quick Info
  //cleaned = normalizeQuickInfo(cleaned);
  
  // PASO 1.6: Normalizar "By the Numbers"
  //cleaned = normalizeByTheNumbers(cleaned);
  
  // PASO 2: Reemplazar asteriscos de listas al inicio de línea
  cleaned = cleaned.replace(/^\* /gm, '- ');
  cleaned = cleaned.replace(/^\*\s*\*\*/gm, '- **');
  cleaned = cleaned.replace(/^\*([^*])/gm, '- $1');
  
  // PASO 3: ELIMINAR asteriscos de énfasis EXCEPTO en FAQs y By the Numbers
  // Preservar **Q: ... ?** y **Label:**
  // Usar placeholders temporales para proteger
  const protectedItems = [];
  
  // Proteger FAQs
  cleaned = cleaned.replace(/\*\*Q:\s*[^?]+\?\*\*/g, (match) => {
    const placeholder = `__PROTECTED_${protectedItems.length}__`;
    protectedItems.push(match);
    return placeholder;
  });
  
  // Proteger labels de By the Numbers: **Duration:** **Price:** etc
  cleaned = cleaned.replace(/\*\*([A-Z][a-z]+[^*]*):\*\*/g, (match) => {
    const placeholder = `__PROTECTED_${protectedItems.length}__`;
    protectedItems.push(match);
    return placeholder;
  });
  
  // Ahora eliminar otros **bold**
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // **text** → text
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');     // *text* → text
  
  // Restaurar items protegidos
  protectedItems.forEach((item, index) => {
    const placeholder = `__PROTECTED_${index}__`;
    cleaned = cleaned.replace(placeholder, item);
  });
  
  // PASO 4: ELIMINAR guiones bajos de énfasis
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');     // __bold__ → bold
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');       // _italic_ → italic
  
  console.log('✅ Contenido limpiado - asteriscos removidos, FAQs y By the Numbers preservados');
  
  return cleaned;
}

/**
 * 🎯 GENERA VARIACIONES DE TÍTULOS - Con KEYWORDS FIJAS: Ciudad + Vehículo + Tour
 */
function generateTitleVariations(originalTitle, city) {
  // Limpiar título
  const clean = originalTitle.replace(/[🛵🏛️📸🍰🧡⭐💰⏱️👥❓]/g, '').trim();
  const lowerTitle = clean.toLowerCase();
  
  // KEYWORDS FIJAS QUE NUNCA VARÍAN EN H1:
  // 1. Ciudad (siempre al inicio)
  // 2. Tipo de vehículo LITERAL (Vespa, Scooter, etc)
  // 3. Actividad principal FUERTE (Photo/Photography, Food/Culinary, etc)
  // 4. "Tour" LITERAL (keyword crítica)
  
  // BANCOS DE SINÓNIMOS - SOLO keywords FUERTES
  const synonyms = {
    // Actividades con keywords FUERTES solamente
    photo: ['Photo', 'Photography'], // NO "Picture" - keyword débil
    food: ['Food', 'Culinary'], // NO "Gastronomy" - menos buscado
    sunset: ['Sunset', 'Golden Hour'], // NO "Evening" - menos específico
    // Características pueden variar
    small: ['Small-Group', 'Small Group', 'Intimate'],
    private: ['Private', 'Exclusive', 'Personal'],
    highlights: ['Highlights', 'Must-See Sights', 'Top Attractions'],
    hidden: ['Hidden Gems', 'Secret Spots', 'Local Favorites']
  };
  
  // Detectar componentes CRÍTICOS
  const hasVespa = lowerTitle.includes('vespa');
  const hasScooter = lowerTitle.includes('scooter') && !hasVespa;
  const hasBike = lowerTitle.includes('bike') || lowerTitle.includes('bicycle');
  const hasPhoto = lowerTitle.includes('photo');
  const hasSmallGroup = lowerTitle.includes('small-group') || lowerTitle.includes('small group');
  const hasPrivate = lowerTitle.includes('private');
  const hasFood = lowerTitle.includes('food') || lowerTitle.includes('culinary');
  const hasSunset = lowerTitle.includes('sunset') || lowerTitle.includes('evening');
  const hasHighlights = lowerTitle.includes('highlights') || lowerTitle.includes('best');
  const hasHidden = lowerTitle.includes('hidden') || lowerTitle.includes('secret');
  
  // Usar hash para selección consistente
  const hash = clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selectSynonym = (category) => {
    const options = synonyms[category];
    return options[hash % options.length];
  };
  
  // ==========================================
  // H1 TITLE (Sanity) - ESTRUCTURA FIJA CON KEYWORDS FUERTES
  // [Ciudad] [Vehículo] [Actividad] Tour [Características] [Destinos]
  // ==========================================
  let h1Parts = [];
  
  // 1. CIUDAD (keyword fija)
  h1Parts.push(city);
  
  // 2. TIPO DE VEHÍCULO LITERAL (keyword fija)
  if (hasVespa) {
    h1Parts.push('Vespa');
  } else if (hasScooter) {
    h1Parts.push('Scooter');
  } else if (hasBike) {
    h1Parts.push('Bike');
  }
  
  // 3. ACTIVIDAD ESPECÍFICA (solo sinónimos FUERTES)
  if (hasPhoto) {
    h1Parts.push(selectSynonym('photo')); // Solo Photo o Photography
  } else if (hasFood) {
    h1Parts.push(selectSynonym('food')); // Solo Food o Culinary
  } else if (hasSunset) {
    h1Parts.push(selectSynonym('sunset')); // Solo Sunset o Golden Hour
  }
  
  // 4. "TOUR" LITERAL (keyword fija - NUNCA varía)
  h1Parts.push('Tour');
  
  // 5. CARACTERÍSTICAS (pueden variar entre sinónimos)
  if (hasPrivate) {
    h1Parts.push(selectSynonym('private'));
  }
  if (hasSmallGroup) {
    h1Parts.push(selectSynonym('small'));
  }
  
  // 6. DESTINOS/HIGHLIGHTS (pueden variar)
  if (hasHighlights) {
    h1Parts.push(selectSynonym('highlights'));
  } else if (hasHidden) {
    h1Parts.push(selectSynonym('hidden'));
  }
  
  const h1Title = h1Parts.join(' ');
  
  // ==========================================
  // H2 TITLE (Body) - MÁS VARIACIÓN PARA DIFERENCIARSE
  // Puede usar Experience/Adventure en lugar de Tour
  // ==========================================
  let h2Parts = [];
  
  // Mantener formato "Ciudad: ..."
  h2Parts.push(city + ':');
  
  // Vehículo literal
  if (hasVespa) {
    h2Parts.push('Vespa');
  } else if (hasScooter) {
    h2Parts.push('Scooter');
  } else if (hasBike) {
    h2Parts.push('Bike');
  }
  
  // Actividad - puede tener más variación en H2
  if (hasPhoto) {
    const photoH2Options = ['Photo', 'Photography'];
    h2Parts.push(photoH2Options[hash % photoH2Options.length]);
  } else if (hasFood) {
    const foodH2Options = ['Food', 'Culinary'];
    h2Parts.push(foodH2Options[hash % foodH2Options.length]);
  } else if (hasSunset) {
    const sunsetH2Options = ['Sunset', 'Evening', 'Golden Hour'];
    h2Parts.push(sunsetH2Options[hash % sunsetH2Options.length]);
  }
  
  // H2 puede variar "Tour" para diferenciarse del H1
  const tourVariations = ['Tour', 'Experience', 'Adventure'];
  h2Parts.push(tourVariations[hash % tourVariations.length]);
  
  // Características
  if (hasPrivate) {
    h2Parts.push('Private');
  }
  if (hasSmallGroup) {
    h2Parts.push('Small-Group');
  }
  
  // Final
  if (hasHighlights) {
    const options = ['Highlights', 'Must-See Sights', 'Top Spots'];
    h2Parts.push(options[hash % options.length]);
  } else if (hasHidden) {
    const hiddenH2Options = ['Hidden Gems', 'Secret Spots'];
    h2Parts.push(hiddenH2Options[hash % hiddenH2Options.length]);
  }
  
  const h2Title = h2Parts.join(' ');
  
  return {
    h1Title: h1Title.trim(),
    h2Title: h2Title.trim(),
    originalTitle: clean
  };
}

/**
 * Detecta la ciudad desde el título o URL
 */
function detectCity(tourData) {
  const text = `${tourData.title} ${tourData.url}`.toLowerCase();
  
  const cities = {
    'rome': 'Rome',
    'roma': 'Rome',
    'paris': 'Paris',
    'london': 'London',
    'barcelona': 'Barcelona',
    'madrid': 'Madrid',
    'florence': 'Florence',
    'venice': 'Venice',
    'milan': 'Milan',
    'naples': 'Naples',
    'miami': 'Miami',
    'buenos aires': 'Buenos Aires',
    'new york': 'New York',
    'garda': 'Riva del Garda',  // ← Agregá este
    'lake garda': 'Riva del Garda'  // ← Y este
  };
  
  for (const [key, value] of Object.entries(cities)) {
    if (text.includes(key)) {
      return value;
    }
  }
  
  return '';
}

/**
 * Genera contenido del tour usando Claude
 */
export async function generateTourContent(tourData) {
  console.log('\n✍️ Generando contenido con Claude...');
  
  try {
    const city = detectCity(tourData);
    
    // 🎯 GENERAR VARIACIONES DE TÍTULOS (homónimos)
    const titleVariations = generateTitleVariations(tourData.title, city);
    
    console.log('📝 Variaciones de títulos generadas:');
    console.log(`   Original GYG: ${titleVariations.originalTitle}`);
    console.log(`   H1 (Sanity):  ${titleVariations.h1Title}`);
    console.log(`   H2 (Body):    ${titleVariations.h2Title}`);
    
    // Preparar datos estructurados para Claude
    const structuredData = {
      city,
      title: titleVariations.h2Title, // Usar h2Title para el cuerpo del contenido
      rating: tourData.rating,
      reviewCount: tourData.reviewCount,
      price: tourData.price,
      duration: tourData.duration,
      groupSize: tourData.groupSize || tourData.features?.groupSize || '10',
      description: tourData.description,
      highlights: tourData.highlights,
      includes: tourData.includes,
      languages: tourData.languages,
      provider: tourData.provider, // ← NUEVO
      reviewQuotes: tourData.reviewQuotes,
      features: tourData.features,
      url: tourData.url
    };
    
    const prompt = promptBuilder(structuredData);
    console.log('\n🔍 DEBUG DURATION:');
    console.log(`structuredData.duration = "${structuredData.duration}"`);
    console.log(`structuredData original:`, structuredData);
    console.log('--- FIN DEBUG DURATION ---\n');
    
    console.log('⏳ Esperando respuesta de Claude...');
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    const rawContent = message.content[0].text;


    
    // 🧹 LIMPIAR CONTENIDO AUTOMÁTICAMENTE
    const content = cleanGeneratedContent(rawContent);
    
    console.log('✅ Contenido generado exitosamente');
    console.log(`   Tokens usados: ${message.usage.input_tokens + message.usage.output_tokens}`);
    
    // Extraer título del contenido generado (debería ser h2Title)
    const titleMatch = content.match(/##\s*🛵\s*(.+)/);
    const bodyTitle = titleMatch ? titleMatch[1].trim() : titleVariations.h2Title;
    
    // 🆕 AGREGADO: Extraer H1 y H2 generados por Claude
    const h1TitleMatch = content.match(/H1_?TITLE:\s*(.+)/i);
    const h2TitleMatch = content.match(/H2_?TITLE:\s*(.+)/i);
    const seoTitleMatch = content.match(/SEO_?TITLE:\s*(.+)/i);
    const seoDescMatch = content.match(/SEO_?DESCRIPTION:\s*(.+)/i);
    const keywordsMatch = content.match(/KEYWORDS:\s*(.+)/i);
    
    // 🆕 AGREGADO: Usar títulos de Claude o fallback
    const finalH1 = h1TitleMatch 
      ? h1TitleMatch[1].trim().substring(0, 60)
      : titleVariations.h1Title; // Fallback al sistema viejo
    
    const finalH2 = h2TitleMatch 
      ? h2TitleMatch[1].trim()
      : titleVariations.h2Title; // Fallback al sistema viejo
    
    const seoTitle = seoTitleMatch 
      ? seoTitleMatch[1].trim().substring(0, 60)
      : generateSEOTitle(titleVariations.h1Title, city);
    
    const seoDescription = seoDescMatch 
      ? seoDescMatch[1].trim().substring(0, 160)
      : generateSEODescription(tourData, city);
    
    const seoKeywords = keywordsMatch 
      ? keywordsMatch[1].split(',').map(k => k.trim()) 
      : generateKeywords(tourData, city);
    
    // VALIDACIÓN DE LONGITUD
    console.log(`📏 H1 Title: ${finalH1.length} chars ${finalH1.length > 60 ? '⚠️ LARGO' : '✅'}`);
    console.log(`📏 SEO Title: ${seoTitle.length} chars ${seoTitle.length > 60 ? '⚠️ EXCEDIDO' : '✅'}`);
    console.log(`📏 SEO Description: ${seoDescription.length} chars ${seoDescription.length > 160 ? '⚠️ EXCEDIDO' : '✅'}`);
    
   // 🆕 MODIFICADO: Limpiar TODOS los campos generados
const cleanContent = content
.replace(/H1_?TITLE:.*\n?/gi, '')
.replace(/H2_?TITLE:.*\n?/gi, '')
.replace(/SEO_?TITLE:.*\n?/gi, '')
.replace(/SEO_?DESCRIPTION:.*\n?/gi, '')
.replace(/KEYWORDS:.*\n?/gi, '')
.trim();


    
    return {
      title: finalH1, // 🆕 MODIFICADO: H1 generado por Claude
      bodyTitle: finalH2, // 🆕 MODIFICADO: H2 generado por Claude
      originalTitle: titleVariations.originalTitle,
      seoTitle,
      seoDescription,
      seoKeywords,
      body: cleanContent,
      city,
      rawContent: cleanContent
    };
    
  } catch (error) {
    console.error('❌ Error generando contenido:', error.message);
    throw error;
  }
}

/**
 * Genera SEO Title optimizado (50-60 caracteres) - Basado en H1
 */
function generateSEOTitle(h1Title, city) {
  // El H1 ya está optimizado con keywords fuertes
  // Solo necesitamos formatear para SEO (max 60 chars)
  
  let seoTitle = h1Title;
  
  // Si el H1 ya tiene ciudad al inicio, quitar "City:" formato
  seoTitle = seoTitle.replace(new RegExp(`^${city}:\\s*`, 'i'), city + ' ');
  
  // Si el título es corto (<= 50 chars), agregar variación
  if (seoTitle.length <= 50) {
    // Intentar agregar "| City Tours" si cabe
    const withSuffix = `${seoTitle} | ${city} Tours`;
    if (withSuffix.length <= 60) {
      return withSuffix;
    }
  }
  
  // Si el título original cabe en 60, usarlo tal cual
  if (seoTitle.length <= 60) {
    return seoTitle;
  }
  
  // Si es muy largo, truncar inteligentemente
  return seoTitle.substring(0, 57) + '...';
}

/**
 * Genera SEO Description RICA con VARIEDAD (150-160 caracteres)
 */
function generateSEODescription(tourData, city) {
  const { rating, price, duration, title, highlights, features } = tourData;
  
  // Detectar tipo de tour
  const isPhoto = title.toLowerCase().includes('photo');
  const isFood = title.toLowerCase().includes('food') || title.toLowerCase().includes('culinary');
  const isPrivate = title.toLowerCase().includes('private');
  const isSmallGroup = features?.smallGroup || title.toLowerCase().includes('small-group');
  const isSunset = title.toLowerCase().includes('sunset');
  const isHighlights = title.toLowerCase().includes('highlights');
  
  // BANCO DE HOOKS VARIADOS - SOLO KEYWORDS FUERTES
  const hooks = {
    photo: [
      `Capture ${city}'s iconic views on this photography-focused Vespa tour.`,
      `Discover ${city}'s most photogenic spots by Vespa with expert photo guidance.`,
      `Explore ${city}'s best photo locations on a scenic Vespa adventure.`,
      `Snap stunning shots across ${city} on this guided Vespa photography tour.`,
      `Experience ${city}'s hidden photo gems on a small-group Vespa tour.`
    ],
    food: [
      `Taste ${city}'s authentic flavors on this culinary Vespa adventure.`,
      `Discover local food gems across ${city} by Vespa with expert guides.`,
      `Experience ${city}'s gastronomic scene on this guided food and Vespa tour.`,
      `Savor authentic ${city} cuisine while exploring by vintage Vespa.`,
      `Journey through ${city}'s best eateries on this delicious Vespa tour.`
    ],
    sunset: [
      `Experience ${city} at golden hour on this scenic sunset Vespa tour.`,
      `Watch ${city} transform at dusk during this magical sunset Vespa ride.`,
      `Ride through ${city}'s landmarks as the sun sets on this evening adventure.`,
      `Discover ${city}'s most romantic viewpoints on this sunset Vespa experience.`,
      `Capture golden hour magic across ${city} on this timed Vespa tour.`
    ],
    private: [
      `Enjoy a personalized ${city} Vespa experience with private guide and custom route.`,
      `Discover ${city} at your own pace on this exclusive private Vespa tour.`,
      `Experience ${city}'s highlights privately with dedicated guide and flexible itinerary.`,
      `Create your perfect ${city} adventure on this customizable private Vespa tour.`,
      `Explore ${city} intimately with personal guide on this exclusive Vespa experience.`
    ],
    highlights: [
      `See ${city}'s must-visit landmarks and hidden corners on this comprehensive Vespa tour.`,
      `Experience ${city}'s top attractions plus local secrets on this curated Vespa adventure.`,
      `Discover both iconic sites and hidden gems across ${city} by vintage Vespa.`,
      `Tour ${city}'s essential landmarks and authentic neighborhoods on this guided Vespa ride.`,
      `Explore ${city}'s greatest hits and insider spots on this complete Vespa experience.`
    ],
    general: [
      `Explore ${city} by Vespa visiting iconic sites and hidden local favorites.`,
      `Discover ${city}'s charm on this guided Vespa tour through historic districts.`,
      `Ride through ${city}'s most beautiful areas on this authentic Vespa adventure.`,
      `Experience ${city} like a local on this immersive small-group Vespa tour.`,
      `Journey across ${city}'s landmarks and neighborhoods on this scenic Vespa ride.`,
      `Navigate ${city}'s cobblestone streets by vintage Vespa with expert local guide.`
    ]
  };
  
  // Seleccionar hook apropiado - usar hash del título para consistencia pero variedad
  let hookCategory = 'general';
  if (isPhoto) hookCategory = 'photo';
  else if (isFood) hookCategory = 'food';
  else if (isSunset) hookCategory = 'sunset';
  else if (isPrivate) hookCategory = 'private';
  else if (isHighlights) hookCategory = 'highlights';
  
  // Usar el primer char del título para seleccionar (da variedad pero es consistente)
  const hookIndex = title.charCodeAt(0) % hooks[hookCategory].length;
  const selectedHook = hooks[hookCategory][hookIndex];
  
  let parts = [selectedHook];
  
  // Features destacadas (máx 3)
  const featuresList = [];
  if (rating && rating >= 4.7) featuresList.push(`${rating}★ rated`);
  if (isSmallGroup && !selectedHook.includes('small-group')) featuresList.push('small groups');
  if (features?.freeCancellation) featuresList.push('free cancellation');
  if (duration) featuresList.push(duration);
  if (price) featuresList.push(`$${price}`);
  
  if (featuresList.length > 0) {
    parts.push(featuresList.slice(0, 3).join(', ') + '.');
  }
  
  // CTAs variados
  const ctas = ['Book now!', 'Reserve today!', 'Book your spot!', 'Join us!', 'Book ahead!'];
  const ctaIndex = title.charCodeAt(1) % ctas.length;
  parts.push(ctas[ctaIndex]);
  
  let description = parts.join(' ');
  
  // Ajustar longitud óptima: 150-160 caracteres
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }
  
  return description;
}

/**
 * Genera keywords (5-7 palabras clave)
 */
function generateKeywords(tourData, city) {
  const keywords = [
    `${city} tours`,
    'scooter tour',
    'vespa tour'
  ];
  
  if (tourData.features?.skipTheLine) {
    keywords.push('skip the line');
  }
  
  if (tourData.features?.smallGroup) {
    keywords.push('small group tour');
  }
  
  if (tourData.title.toLowerCase().includes('photo')) {
    keywords.push('photography tour');
  }
  
  if (tourData.title.toLowerCase().includes('food')) {
    keywords.push('food tour');
  }
  
  return keywords.slice(0, 7);
}