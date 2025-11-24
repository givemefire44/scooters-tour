'use client';

import { useState, useEffect, Children, isValidElement, ReactNode } from 'react';
import { addAutoLinks } from '../utils/autoLinker';

// 🆕 FUNCIÓN PARA DETECTAR Y LINKEAR URLs Y EMAILS
function linkifyUrls(text: string): string {
  // Regex para URLs (http, https, www)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  
  // Regex para emails
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  
  // Primero linkear URLs
  text = text.replace(urlRegex, (url) => {
    const href = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 500;">${url}</a>`;
  });
  
  // Después linkear emails
  text = text.replace(emailRegex, (email) => {
    return `<a href="mailto:${email}" style="color: #2563eb; text-decoration: underline; font-weight: 500;">${email}</a>`;
  });
  
  return text;
}

interface UnifiedAutoLinkerProps {
  children: any;
  pageSlug?: string;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

// 🔍 DETECTAR SI YA HAY LINKS DE SANITY
function hasExistingLinks(children: any): boolean {
  if (!children) return false;
  
  // Si es un elemento React con type 'a'
  if (isValidElement(children) && children.type === 'a') {
    return true;
  }
  
  // Si es array, revisar cada elemento
  if (Array.isArray(children)) {
    return children.some(child => hasExistingLinks(child));
  }
  
  // Si tiene props.children, revisar recursivamente
  if (isValidElement(children)) {
    const element = children as React.ReactElement<{ children?: any }>;
    if (element.props.children) {
      return hasExistingLinks(element.props.children);
    }
  }
  
  return false;
}

// 🆕 DETECTAR SI HAY MARKS (negritas, cursivas, etc.)
function hasMarks(children: any): boolean {
  if (!children) return false;
  
  // Si es un elemento React con tags HTML como <strong>, <em>, etc.
  if (isValidElement(children)) {
    const type = (children as any).type;
    if (type === 'strong' || type === 'em' || type === 'code' || type === 'span') {
      return true;
    }
  }
  
  // Si es array, revisar cada elemento
  if (Array.isArray(children)) {
    return children.some(child => hasMarks(child));
  }
  
  return false;
}

// 🔄 FUNCIÓN PARA EXTRAER TEXTO
function extractTextFromChildren(children: any): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (Array.isArray(children)) {
    return children.map(child => {
      if (typeof child === 'string') {
        return child;
      }
      if (child?.props?.children) {
        return extractTextFromChildren(child.props.children);
      }
      return '';
    }).join(' ');
  }
  
  if (children?.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  
  return '';
}

// 🚀 COMPONENTE UNIFICADO CON DETECCIÓN DE LINKS, URLs Y MARKS
export default function UnifiedAutoLinker({ 
  children, 
  pageSlug, 
  className = 'content-paragraph',
  style = {},
  disabled = false
}: UnifiedAutoLinkerProps) {
  
  // 🎯 SI DISABLED, RENDERIZAR SIN PROCESAR
  if (disabled) {
    return (
      <p className={className} style={style}>
        {children}
      </p>
    );
  }
  
  const hasLinks = hasExistingLinks(children);
  const hasFormattingMarks = hasMarks(children);
  
  // 🔥 SI HAY MARKS (negritas, cursivas, etc.), NO PROCESAR
  // Renderizar directo para preservar formato
  if (hasLinks || hasFormattingMarks) {
    return (
      <p className={className} style={style}>
        {children}
      </p>
    );
  }
  
  const plainText = extractTextFromChildren(children);
  const [linkedText, setLinkedText] = useState(plainText);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    if (!plainText || plainText.trim().length === 0) {
      setLinkedText(plainText);
      return;
    }

    const processAutoLinks = async () => {
      setIsProcessing(true);
      
      try {
        // 🆕 PASO 1: Primero linkear URLs y emails
        let result = linkifyUrls(plainText);
        
        // 🆕 PASO 2: Solo aplicar autoLinker si NO hay URLs (evitar conflictos)
        const hasUrls = result.includes('<a href');
        
        if (!hasUrls) {
          result = await addAutoLinks(
            plainText, 
            {
              maxLinksPerPage: 12,
              maxLinksPerKeyword: 2,
              maxDensity: 2.0,
              minWordsBetween: 80
            },
            {
              tourSlug: pageSlug
            }
          );
        }
        
        setLinkedText(result);
      } catch (error) {
        console.error('⚠️ Error processing auto-links:', error);
        setLinkedText(linkifyUrls(plainText));
      } finally {
        setIsProcessing(false);
      }
    };

    processAutoLinks();
  }, [isClient, plainText, pageSlug]);
  
  return (
    <p 
      className={`${className} ${isProcessing ? 'processing' : ''}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: linkedText }}
    />
  );
}

export const autoLinkerStyles = `
  .auto-link {
    color: #8816c0;
    text-decoration: none;
    border-bottom: 1px dotted #8816c0;
    transition: all 0.2s ease;
  }
  
  .sanity-sync-link {
    background: linear-gradient(90deg, transparent 0%, rgba(136, 22, 192, 0.05) 50%, transparent 100%);
    background-size: 0% 100%;
    background-repeat: no-repeat;
    background-position: left;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .auto-link:hover {
    background-color: #f8f4ff;
    border-bottom: 1px solid #8816c0;
    text-decoration: none;
    transform: translateY(-1px);
  }
  
  .sanity-sync-link:hover {
    background-size: 100% 100%;
    border-bottom: 2px solid #8816c0;
  }
  
  .auto-link:visited {
    color: #6b46c1;
  }
  
  .content-paragraph.processing {
    opacity: 0.8;
    transition: opacity 0.3s ease;
  }
  
  .sanity-sync-link::after {
    content: "🔄";
    font-size: 8px;
    opacity: 0;
    margin-left: 2px;
    transition: opacity 0.2s ease;
    position: absolute;
    top: -2px;
    color: #8816c0;
  }
  
  .sanity-sync-link:hover::after {
    opacity: 0.6;
  }
  
  @media (max-width: 768px) {
    .sanity-sync-link::after {
      display: none;
    }
  }
`;