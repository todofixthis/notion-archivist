import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { Article } from "../types";

/**
 * Converts HTML into Markdown format.
 *
 * Notion doesn't have a facility for importing content directly from Markdown, but it
 * does allow us to present the content in a format that's easy for the user to edit
 * before adding to Notion.
 */
export class ArticleFormatterService {
  private formatter: TurndownService;

  constructor() {
    this.formatter = new TurndownService({
      bulletListMarker: "*",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
      headingStyle: "atx",
      hr: "---",
      strongDelimiter: "**",
    });
  }

  /**
   * Given raw HTML, attempts to extract and format the article content.
   * @param html Full HTML page (including `<head>` and complete `<body>` contents).
   * @throws Error if it can't find anything that looks like an article in the page.
   *
   * Note: under the hood, this function uses Mozilla's Readability library, so if this
   * method throws on a page that should have an article, look at these docs:
   * @see https://github.com/mozilla/readability
   */
  public formatArticle(html: string): Article {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const reader = new Readability(doc);
    const article = reader.parse();

    if (!article) {
      throw new Error("No article content found.");
    }

    return {
      byline: article.byline || "",
      length: article.length,
      markdownContent: this.formatter.turndown(article.content),
      title: article.title,
    };
  }
}
