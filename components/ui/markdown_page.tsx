'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

type MarkdownPageProps = {
  title: string;
  content: string;
  backLink?: string;
};

export default function MarkdownPage({ title, content, backLink = '/' }: MarkdownPageProps) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-6">
        <Link
          href={backLink}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Go Back
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">{title}</h1>
        <article className="prose prose-gray max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
