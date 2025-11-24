# 🛵 ScootersTour - Tour Importer

Automatización completa para importar tours desde GetYourGuide a Sanity CMS.

## 🚀 Instalación
```bash
npm install
```

## ⚙️ Configuración

1. Copiá `.env.local.example` a `.env.local`
2. Completá las credenciales:
   - `SANITY_PROJECT_ID`
   - `SANITY_TOKEN`
   - `ANTHROPIC_API_KEY`

## 📖 Uso

### Modo Prueba (Dry Run)
```bash
npm run test https://www.getyourguide.com/rome-l33/vespa-tour-t12345
```

### Modo Producción
```bash
DRY_RUN=false npm run import https://www.getyourguide.com/rome-l33/vespa-tour-t12345
```

## ✨ Lo que hace

1. ✅ Extrae datos de GetYourGuide (scraping)
2. ✅ Descarga y convierte imágenes AVIF → JPG
3. ✅ Genera contenido único con Claude AI
4. ✅ Crea post DRAFT en Sanity
5. ✅ Genera SEO optimizado

## 🎯 Después de ejecutar

1. Abrí Sanity Studio
2. Buscá el post creado
3. Seleccioná la categoría/ciudad
4. Revisá el contenido
5. ¡Publish!

## 🛡️ Seguridad

- Rate limiting: 5 segundos entre requests
- Dry run por defecto
- Logs completos de cada paso

## 📝 Licencia

MIT