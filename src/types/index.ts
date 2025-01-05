/**
 * Readability data extracted from an article.
 */
export type Article = {
  title: string;
  byline: string;
  markdownContent: string;
  length: number;
};

/**
 * Info about the browser tab from which content will be extracted.
 */
export type BrowserTab = {
  id: number;
  url: string;
};

/**
 * Raw content extracted from a page.
 */
export type PageContent = {
  html: string;
  url: string;
  ogImage: string | null;
};
