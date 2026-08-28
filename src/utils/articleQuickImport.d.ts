import type { StructuredArticleContent } from '@/api/adminArticles'

export class ArticleQuickImportError extends Error {}
export function parseKqcArticleImport(input: string): StructuredArticleContent
export function hasMeaningfulStructuredContent(value: StructuredArticleContent): boolean
