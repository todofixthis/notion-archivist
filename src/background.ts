import { ArticleMetadata, PageContent } from "./types";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

const createFormatter = (): TurndownService => {
  return new TurndownService({
    // atx = mainstream markdown; setext = reStructuredText-style
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "*",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    strongDelimiter: "**",
  });
}

const formatArticle = (article: ArticleMetadata): string => {
  return createFormatter().turndown(article.content)
}

browser.action.onClicked.addListener(async (tab): Promise<void> => {
  if (!tab.id) {
    throw new Error("No browser tab available.")
  }

  const pageContent: PageContent = await browser.tabs.sendMessage(tab.id, "extractContent")

  const doc = new DOMParser().parseFromString(pageContent.html, "text/html");
  const reader = new Readability(doc);
  const article = reader.parse();

  if (!article) {
    throw new Error("Cannot find an article on this page.")
  }

  const markdownArticle = formatArticle(article)

  console.log(
      `# ${article.title}`,
      `**URL:** ${pageContent.url}`,
      `**Author:** ${article.byline}`,
      `**Image:** ${pageContent.ogImage}`,
      markdownArticle,
  )
})