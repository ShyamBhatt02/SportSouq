import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE } from '@/config/site';
import { imageUrl } from '@/data/images';

interface SeoOptions {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  /** Structured data (JSON-LD). Serialised via textContent — never innerHTML. */
  jsonLd?: Record<string, unknown> | null;
}

const DEFAULT_DESCRIPTION =
  'Shop premium sports gear in the UAE: football, cricket, running, fitness and more. AED pricing, same-day delivery in Dubai, Cash on Delivery and easy returns.';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>('meta[' + attr + '="' + key + '"]');
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="' + rel + '"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Dynamic title, meta description, Open Graph, canonical URL and JSON-LD. */
export function useSeo({ title, description = DEFAULT_DESCRIPTION, image, type = 'website', noindex = false, jsonLd }: SeoOptions) {
  const { pathname } = useLocation();
  const jsonString = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const fullTitle = title.includes(SITE.name) ? title : title + ' | ' + SITE.name + ' UAE';
    document.title = fullTitle;
    const canonical = SITE.url.replace(/\/$/, '') + pathname;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', canonical);
    if (image) setMeta('property', 'og:image', imageUrl(image, 1200, 630));
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setLink('canonical', canonical);

    const id = 'ss-jsonld';
    document.getElementById(id)?.remove();
    if (jsonString) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.textContent = jsonString;
      document.head.appendChild(script);
    }
  }, [title, description, image, type, noindex, pathname, jsonString]);
}
