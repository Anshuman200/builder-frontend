import { Metadata } from 'next';
import SitePageClient from './SitePageClient';

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

async function getPageData(slug: string) {
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3019/api';
  try {
    const res = await fetch(`${API}/site-pages/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.page;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const pageContent = await getPageData(slug);
  
  if (!pageContent) return { title: 'Page Not Found' };

  return {
    title: pageContent.title,
    description: pageContent.meta?.description || 'Build your beautiful landing page with PageCraft.',
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
  const pageContent = await getPageData(params.slug);
  return <SitePageClient pageContent={pageContent} />;
}
