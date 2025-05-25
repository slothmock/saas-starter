import { getMarkdownContent } from '@/lib/getMarkdownContent';
import MarkdownPage from '@/components/ui/markdown_page';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const promise = await Promise.resolve(params);
  return {
    title: `${toTitleCase(promise.slug.replace(/-/g, ' '))} | PembsWasteSMS`,
  };
}

export default async function LegalPage(props: Params) {
  const params = await props.params;
  try {
    const promise = await Promise.resolve(params);
    const content = await getMarkdownContent(promise.slug);
    const title = toTitleCase(promise.slug.replace(/-/g, ' '));
    return <MarkdownPage title={title} content={content} backLink="/" />;
  } catch (err) {
    return notFound();
  }
}

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.substring(1));
}
