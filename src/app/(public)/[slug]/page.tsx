import { Metadata } from 'next';
import SitePageClient from './SitePageClient';
import { request } from '@/lib/api/client';

/**
 * Public Site Page (Server Component).
 * Using granular 'cacheLife' and Next.js 15+ Cache Components.
 */

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPageData(slug: string) {
  try {
    const { data } = await request<{ page: any }>(`/site-pages/${slug}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    return data.page || data;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageContent = await getPageData(slug);

  if (!pageContent) return { title: 'Page Not Found' };

  return {
    title: pageContent.title,
    description: pageContent.meta?.description || 'Build your beautiful landing page with Solario Forge.',
    openGraph: {
      title: pageContent.title,
      description: pageContent.meta?.description,
      images: pageContent.meta?.ogImage ? [{ url: pageContent.meta.ogImage }] : [],
      type: 'website',
    },
    icons: pageContent.meta?.favicon ? { icon: pageContent.meta.favicon } : undefined,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const pageContent = await getPageData(slug);
  return <SitePageClient pageContent={pageContent} />;
}
