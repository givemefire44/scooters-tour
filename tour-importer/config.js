import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export const config = {
  sanity: {
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false
  },
  
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  
  affiliate: {
    partnerId: process.env.AFFILIATE_PARTNER_ID || '2FVNDZG',
    utmMedium: 'online_publisher'
  },
  
  scraper: {
    rateLimitMs: parseInt(process.env.RATE_LIMIT_MS) || 5000,
    headless: true,
    userAgent: 'ScootersTour-Bot/1.0 (mario@scooterstour.com)'
  },
  
  dryRun: process.env.DRY_RUN === 'true',
  
  siteUrl: 'https://scooterstour.com',
  siteName: 'ScootersTour'
};

// Validación
if (!config.sanity.projectId || !config.sanity.token) {
  console.error('❌ Error: Faltan credenciales de Sanity en .env.local');
  process.exit(1);
}

if (!config.anthropic.apiKey) {
  console.error('❌ Error: Falta ANTHROPIC_API_KEY en .env.local');
  process.exit(1);
}

console.log('✅ Configuración cargada correctamente');
console.log(`📍 Modo: ${config.dryRun ? 'DRY RUN (prueba)' : 'PRODUCCIÓN'}`);