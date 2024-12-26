/**
 * Data from a formatted article, ready to export to Notion.
 */
// tslint:disable-next-line:interface-over-type-literal
export type Article = {
  title: string;
  byline?: string;
  markdownContent: string;
  length: number;
};

/**
 * Info about the browser tab from which content will be extracted.
 */
// tslint:disable-next-line:interface-over-type-literal
export type BrowserTab = {
  id: number;
  url: string;
};

/**
 * Raw content extracted from a page.
 */
// tslint:disable-next-line:interface-over-type-literal
export type PageContent = {
  html: string;
  url: string;
  ogImage: string | null;
};
