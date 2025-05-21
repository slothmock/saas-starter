import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function getMarkdownContent(fileName: string) {
  const filePath = path.join(process.cwd(), 'content/legal/', `${fileName}.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(fileContents);

  return content;
}