export interface ArticleMetadata {
  title: string;
  byline?: string;
  content: string;
  length: number;
}

export interface PageContent {
  html: string;
  url: string;
  ogImage: string | null;
}
