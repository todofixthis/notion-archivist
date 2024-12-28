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
