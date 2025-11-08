// utils/autoLinker.ts - SISTEMA CIRCULAR DE PROXIMIDAD 🔄 - VERSIÓN SEGURA

import { client } from '@/sanity/lib/client';

interface AutoLinkerConfig {
  maxLinksPerPage: number;
  maxLinksPerKeyword?: number;
  minWordsBetween: number;
  maxDensity: number;
  currentTourSlug?: string;
}

interface KeywordConfig {
  maxLinks: number;
  priority: number;
  variations?: string[];
}

// 🛡️ KEYWORDS SEGUROS - DISTRIBUCIÓN GOOGLE-PROOF
const KEYWORDS_CONFIG: Record<string, KeywordConfig> = {
  
  // 💰 COMMERCIAL ANCHORS (15% total) - REDUCIDO SIGNIFICATIVAMENTE
  'colosseum tickets': {
    maxLinks: 1, // REDUCIDO de 2 a 1
    priority: 6, // REDUCIDO de 10 a 6  
    variations: ['tickets', 'entrance passes'] // MÁS SUAVE
  },
  
  'guided tour': {
    maxLinks: 1, // REDUCIDO de 2 a 1
    priority: 5, // REDUCIDO de 6 a 5
    variations: ['tour experience'] // MENOS AGRESIVO
  },

  'vip access': {
    maxLinks: 1,
    priority: 5, // REDUCIDO de 9 a 5
    variations: ['exclusive access', 'premium experience']
  },

  // 📚 INFORMATIONAL/PARTIAL MATCH (30% total) - NUEVO Y SEGURO
  'ancient amphitheater': {
    maxLinks: 2,
    priority: 8, // ALTA PRIORIDAD PERO SEGURO
    variations: [
      'roman amphitheater', 
      'historic amphitheater',
      'ancient roman structure'
    ]
  },

  'gladiator history': {
    maxLinks: 1,
    priority: 7,
    variations: [
      'gladiator stories',
      'ancient entertainment', 
      'roman spectacles'
    ]
  },

  'roman empire': {
    maxLinks: 1,
    priority: 6,
    variations: [
      'ancient rome',
      'imperial rome', 
      'roman civilization'
    ]
  },

  'archaeological site': {
    maxLinks: 1,
    priority: 6,
    variations: [
      'historic site',
      'ancient monument',
      'cultural heritage'
    ]
  },

  // 🏷️ BRANDED ANCHORS (25% total) - CRÍTICO PARA PARECER NATURAL
  'our experience': {
    maxLinks: 2,
    priority: 8, // ALTA PRIORIDAD
    variations: [
      'our tours',
      'our guides', 
      'this experience',
      'our recommendations'
    ]
  },

  'we recommend': {
    maxLinks: 1,
    priority: 6,
    variations: [
      'we suggest',
      'our advice',
      'expert recommendation'
    ]
  },

  'this site': {
    maxLinks: 1,
    priority: 5,
    variations: [
      'our platform',
      'our service',
      'this platform'
    ]
  },

  // 🔗 GENERIC ANCHORS (20% total) - SÚPER SEGUROS
  'more information': {
    maxLinks: 2,
    priority: 6,
    variations: [
      'learn more',
      'read more',
      'discover more',
      'find out more'
    ]
  },

  'detailed guide': {
    maxLinks: 1,
    priority: 5,
    variations: [
      'complete guide',
      'comprehensive guide',
      'travel guide'
    ]
  },

  'useful information': {
    maxLinks: 1,
    priority: 4,
    variations: [
      'helpful tips',
      'practical advice',
      'visitor information'
    ]
  },

  // 🎯 NAKED/NATURAL ANCHORS (15% total) - MUY SEGUROS
  'here': {
    maxLinks: 2,
    priority: 5,
    variations: [
      'click here',
      'this link',
      'check this out'
    ]
  },

  'this article': {
    maxLinks: 1,
    priority: 4,
    variations: [
      'this post',
      'this guide',
      'this resource'
    ]
  },

  // 🏛️ MANTENER ALGUNOS EXISTENTES PERO REDUCIDOS
  'colosseum': {
    maxLinks: 1, // REDUCIDO de 2 a 1
    priority: 5, // REDUCIDO de 8 a 5
    variations: ['roman colosseum', 'ancient colosseum']
  },

  'roman colosseum tour': {
    maxLinks: 1,
    priority: 4, // REDUCIDO de 8 a 4
    variations: ['rome tour', 'historical tour']
  },

  'palatine hill': {
    maxLinks: 1,
    priority: 4, // REDUCIDO de 7 a 4
    variations: ['palatine museum', 'palatino']
  },

  'roman forum': {
    maxLinks: 1,
    priority: 4, // REDUCIDO de 7 a 4
    variations: ['forum romano', 'ancient forum']
  },

  'arena floor': {
    maxLinks: 1,
    priority: 4, // REDUCIDO de 7 a 4
    variations: ['arena access', 'gladiator arena']
  },

  'small group tour': {
    maxLinks: 1,
    priority: 4, // REDUCIDO de 6 a 4
    variations: ['intimate tour', 'small group']
  },

  // ⛪ VATICAN REDUCIDO
  'vatican': {
    maxLinks: 1, // REDUCIDO de 2 a 1
    priority: 4, // REDUCIDO de 8 a 4
    variations: ['vatican city', 'vatican museums']
  },

  'sistine chapel': {
    maxLinks: 1,
    priority: 4, // REDUCIDO de 7 a 4
    variations: ['sistine chapel tour', 'michelangelo chapel']
  },

  "st peter's basilica": {
    maxLinks: 1,
    priority: 4, // REDUCIDO de 7 a 4
    variations: ['st peters basilica', 'papal basilica']
  },

  // 🏛️ ROME ATTRACTIONS REDUCIDO
  'pantheon': {
    maxLinks: 1,
    priority: 3, // REDUCIDO de 6 a 3
    variations: ['roman pantheon']
  },

  'trevi fountain': {
    maxLinks: 1,
    priority: 3, // REDUCIDO de 6 a 3
    variations: ['fontana di trevi']
  },

  'spanish steps': {
    maxLinks: 1,
    priority: 3, // REDUCIDO de 5 a 3
    variations: ['scalinata di spagna']
  }
};

// 🛡️ CONFIGURACIÓN SEGURA
const defaultConfig: AutoLinkerConfig = {
  maxLinksPerPage: 8,        // REDUCIDO de 10 a 8
  maxLinksPerKeyword: 1,     // REDUCIDO de 2 a 1  
  minWordsBetween: 120,      // AUMENTADO de 100 a 120
  maxDensity: 1.5            // REDUCIDO de 2.0 a 1.5
};

// 🔄 CACHE Y PÁGINAS ORDENADAS
let urlsCache: string[] = [];
let cacheInitialized = false;
let sortedPages: PageInfo[] = [];

interface PageInfo {
  url: string;
  slug: string;
  createdAt: string;
}

// 🎯 STORAGE GLOBAL DE CONTADORES 
const globalCounters = new Map<string, Map<string, number>>();

interface LinkOpportunity {
  keyword: string;
  baseKeyword: string;
  url: string;
  position: number;
  length: number;
  priority: number;
  maxAllowed: number;
}

class CircularProximityAutoLinker {
  private config: AutoLinkerConfig;
  private allPages: PageInfo[] = [];
  private keywordCounts: Map<string, number>;
  private pageId: string;

  constructor(config: Partial<AutoLinkerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.pageId = config.currentTourSlug || 'default-page';
    
    if (!globalCounters.has(this.pageId)) {
      globalCounters.set(this.pageId, new Map());
    }
    this.keywordCounts = globalCounters.get(this.pageId)!;
  }

  async processText(text: string): Promise<string> {
    if (!text || typeof text !== 'string') return text;
    
    await this.syncPagesFromSanity();
    
    const totalWords = this.countWords(text);
    const opportunities = this.findCircularOpportunities(text);
    const selectedLinks = this.selectLinksWithSafety(opportunities, totalWords);
    
    return this.applyLinks(text, selectedLinks);
  }

  // 🔄 SYNC PÁGINAS CON FECHA DE CREACIÓN
  private async syncPagesFromSanity(): Promise<void> {
    if (cacheInitialized && sortedPages.length > 0) {
      this.allPages = sortedPages;
      return;
    }

    try {
      const data = await client.fetch(`
        {
          "posts": *[_type == "post" && defined(slug.current)][0...100] | order(_createdAt asc) {
            "slug": slug.current,
            "createdAt": _createdAt,
            "type": "post"
          },
          "pages": *[_type == "page" && defined(slug.current)][0...20] | order(_createdAt asc) {
            "slug": slug.current,
            "createdAt": _createdAt,
            "type": "page"
          }
        }
      `);

      const pages: PageInfo[] = [];
      
      // 🔄 AGREGAR POSTS
      if (data.posts) {
        data.posts.forEach((post: any) => {
          if (post.slug) {
            pages.push({
              url: `/tour/${post.slug}`,
              slug: post.slug,
              createdAt: post.createdAt
            });
          }
        });
      }

      // 🔄 AGREGAR PÁGINAS ESTÁTICAS
      if (data.pages) {
        data.pages.forEach((page: any) => {
          if (page.slug) {
            pages.push({
              url: `/${page.slug}`,
              slug: page.slug,
              createdAt: page.createdAt
            });
          }
        });
      }

      // 🔄 ORDENAR POR FECHA DE CREACIÓN
      sortedPages = pages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      cacheInitialized = true;
      this.allPages = sortedPages;

      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log(`🛡️ SAFE AutoLinker: ${pages.length} pages synced - Safe config active`);
      }
      
    } catch (error) {
      this.allPages = [];
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('❌ AutoLinker sync failed');
      }
    }
  }

  // 🎯 BUSCAR OPORTUNIDADES CON SISTEMA CIRCULAR
  private findCircularOpportunities(text: string): LinkOpportunity[] {
    const opportunities: LinkOpportunity[] = [];
    
    if (this.allPages.length === 0) return opportunities;
    
    Object.entries(KEYWORDS_CONFIG).forEach(([baseKeyword, config]) => {
      const targetUrl = this.findCircularTarget(baseKeyword);
      if (!targetUrl) return;

      const allVariations = [baseKeyword, ...(config.variations || [])];
      
      allVariations.forEach(variation => {
        const regex = new RegExp(`\\b${this.escapeRegex(variation)}\\b`, 'gi');
        let match;
        let linkCount = 0;

        while ((match = regex.exec(text)) !== null && linkCount < config.maxLinks) {
          if (this.isInsideLink(text, match.index)) continue;
          
          // 🛡️ PROBABILIDAD DE SALTEAR (35% chance)
          if (Math.random() < 0.35) continue;
          
          // 🎯 VERIFICAR DISTANCIA MÍNIMA PARA SEGUNDO LINK
          if (linkCount > 0) {
            const lastOpportunity = opportunities
              .filter(opp => opp.baseKeyword === baseKeyword)
              .pop();
            
            if (lastOpportunity) {
              const distance = match.index - (lastOpportunity.position + lastOpportunity.length);
              const wordDistance = distance / 5; // Aproximación
              
              if (wordDistance < this.config.minWordsBetween) {
                continue; // Muy cerca del anterior
              }
            }
          }

          opportunities.push({
            keyword: match[0],
            baseKeyword: baseKeyword,
            url: targetUrl,
            position: match.index,
            length: match[0].length,
            priority: config.priority,
            maxAllowed: config.maxLinks
          });
          
          linkCount++;
        }
      });
    });

    return opportunities.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.position - b.position;
    });
  }

  // 🔄 ENCONTRAR TARGET CIRCULAR MÁS CERCANO
  private findCircularTarget(keyword: string): string | null {
    const currentPageIndex = this.allPages.findIndex(page => 
      page.slug === this.pageId
    );
    
    if (currentPageIndex === -1) return null;

    // 🔄 BÚSQUEDA CIRCULAR DESDE PÁGINA SIGUIENTE
    const totalPages = this.allPages.length;
    
    for (let i = 1; i < totalPages; i++) {
      const nextIndex = (currentPageIndex + i) % totalPages;
      const candidatePage = this.allPages[nextIndex];
      
      // 🎯 VERIFICAR SI EL SLUG CONTIENE LA KEYWORD
      if (this.slugContainsKeyword(candidatePage.slug, keyword)) {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log(`🔄 Safe circular link: "${keyword}" → ${candidatePage.url}`);
        }
        return candidatePage.url;
      }
    }
    
    return null; // No se encontró target
  }

  // 🔍 VERIFICAR SI SLUG CONTIENE KEYWORD
  private slugContainsKeyword(slug: string, keyword: string): boolean {
    const slugLower = slug.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    
    // Para keywords compuestas, verificar cada palabra
    const keywordWords = keywordLower.split(' ');
    
    return keywordWords.every(word => 
      slugLower.includes(word.trim())
    );
  }

  // 🛡️ SELECCIÓN DE LINKS CON SAFETY CHECKS
  private selectLinksWithSafety(opportunities: LinkOpportunity[], totalWords: number): LinkOpportunity[] {
    const selected: LinkOpportunity[] = [];
    
    // 🛡️ CATEGORÍAS PARA DISTRIBUCIÓN SEGURA
    const categoryCounts = {
      commercial: 0,
      informational: 0,
      branded: 0,
      generic: 0,
      naked: 0
    };

    // Clasificar keywords por categoría
    const getKeywordCategory = (keyword: string): keyof typeof categoryCounts => {
      const commercial = ['colosseum tickets', 'guided tour', 'vip access'];
      const branded = ['our experience', 'we recommend', 'this site'];
      const generic = ['more information', 'detailed guide', 'useful information'];
      const naked = ['here', 'this article'];
      
      if (commercial.includes(keyword)) return 'commercial';
      if (branded.includes(keyword)) return 'branded';
      if (generic.includes(keyword)) return 'generic';
      if (naked.includes(keyword)) return 'naked';
      return 'informational';
    };

    for (const opp of opportunities) {
      if (selected.length >= this.config.maxLinksPerPage) break;
      
      const currentCount = this.keywordCounts.get(opp.baseKeyword) || 0;
      const maxForKeyword = Math.min(
        opp.maxAllowed,
        this.config.maxLinksPerKeyword || opp.maxAllowed
      );
      
      if (currentCount >= maxForKeyword) continue;
      
      const density = (selected.length / totalWords) * 100;
      if (density >= this.config.maxDensity) break;

      // 🛡️ VERIFICAR DISTRIBUCIÓN SEGURA
      const category = getKeywordCategory(opp.baseKeyword);
      const maxCommercial = Math.ceil(this.config.maxLinksPerPage * 0.20); // 20% máximo
      
      if (category === 'commercial' && categoryCounts.commercial >= maxCommercial) {
        continue; // Skip si ya tenemos suficientes commercial
      }
      
      selected.push(opp);
      categoryCounts[category]++;
      this.keywordCounts.set(opp.baseKeyword, currentCount + 1);
    }

    // 🛡️ LOG DE DISTRIBUCIÓN EN DEVELOPMENT
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && selected.length > 0) {
      console.log('🛡️ Safe anchor distribution:', categoryCounts);
    }

    return selected;
  }

  // MÉTODOS AUXILIARES
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private isInsideLink(text: string, pos: number): boolean {
    const before = text.substring(0, pos);
    const after = text.substring(pos);
    const lastOpen = before.lastIndexOf('<a ');
    const lastClose = before.lastIndexOf('</a>');
    return lastOpen > lastClose && after.indexOf('</a>') !== -1;
  }

  private applyLinks(text: string, selectedLinks: LinkOpportunity[]): string {
    const sorted = selectedLinks.sort((a, b) => b.position - a.position);
    let result = text;
    
    sorted.forEach(link => {
      const before = result.substring(0, link.position);
      const linkText = result.substring(link.position, link.position + link.length);
      const after = result.substring(link.position + link.length);
      
      const html = `<a href="${link.url}" class="auto-link safe-link" title="More about ${linkText}">${linkText}</a>`;
      result = before + html + after;
    });

    return result;
  }
}

// 🚀 FUNCIÓN PRINCIPAL EXPORTADA
export async function addAutoLinks(
  text: string, 
  config?: Partial<AutoLinkerConfig>,
  context?: { tourSlug?: string }
): Promise<string> {
  const linker = new CircularProximityAutoLinker({
    ...config,
    currentTourSlug: context?.tourSlug
  });
  
  return linker.processText(text);
}

// 🧹 RESET CONTADORES
export function resetPageCounters(pageSlug?: string): void {
  if (pageSlug) {
    globalCounters.delete(pageSlug);
  } else {
    globalCounters.clear();
  }
}

// Hook React SEGURO para Vercel
import { useState, useEffect } from 'react';

export function useSanityAutoLinker(
  content: string,
  config?: Partial<AutoLinkerConfig>,
  context?: { tourSlug?: string }
): { linkedContent: string; isProcessing: boolean } {
  const [linkedContent, setLinkedContent] = useState(content);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!content?.trim()) {
      setLinkedContent(content);
      return;
    }

    let isMounted = true;
    setIsProcessing(true);

    addAutoLinks(content, config, context)
      .then(result => {
        if (isMounted) {
          setLinkedContent(result);
        }
      })
      .catch(error => {
        if (isMounted) {
          setLinkedContent(content);
        }
        if (process.env.NODE_ENV === 'development') {
          console.error('AutoLinker error:', error);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsProcessing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [content, JSON.stringify(config), context?.tourSlug]);

  return { linkedContent, isProcessing };
}