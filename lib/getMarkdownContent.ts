import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Retrieves the content of a Markdown file from the 'content/legal/' directory.
 *
 * @param fileName - The name of the Markdown file (without extension) to be read.
 * @returns The content of the Markdown file as a string.
 * @throws Will throw an error if the file does not exist.
 */
export async function getMarkdownContent(fileName: string) {
  const filePath = path.join(process.cwd(), 'content/legal/', `${fileName}.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(fileContents);

  return content;
}