import { Metadata } from 'next';
import PreviewClient from './PreviewClient';
import { request } from '@/lib/api/client';

interface Props {
  params: Promise<{ 
    pageId: string;
  }>;
}

async function getPageData(id: string) {
  try {
    const res = await request(`/pages/${id}`, { cache: 'no-store' });
    return res.data?.page || res.data;
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageId } = await params;
  const data = await getPageData(pageId);
  
  if (!data) return { title: 'Preview' };

  return {
    title: `${data.title} | Preview`,
    description: data.meta?.description || 'Page preview',
    openGraph: {
      title: data.title,
      description: data.meta?.description,
      images: data.meta?.ogImage ? [{ url: data.meta.ogImage }] : [],
      type: 'website',
    },
    icons: data.meta?.favicon ? { icon: data.meta.favicon } : undefined,
  };
}

export default async function Page({ params }: Props) {
  const { pageId } = await params;
  const initialData = await getPageData(pageId);
  
  return <PreviewClient pageId={pageId} initialData={initialData} initialPath="/" />;
}
