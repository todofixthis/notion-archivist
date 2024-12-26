import { Article, BrowserTab, PageContent } from "../types"
import { Readability } from "@mozilla/readability"
import TurndownService from "turndown"

/**
 * Converts HTML into Notion’s Markdown format.
 */
class ArticleFormatter {
  private formatter: TurndownService

  constructor() {
    this.formatter = new TurndownService({
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "*",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
      strongDelimiter: "**",
    })
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
  formatArticle(html: string): Article {
    const doc = new DOMParser().parseFromString(html, "text/html")
    const reader = new Readability(doc)
    const article = reader.parse()

    if (!article) {
      throw new Error("No article content found.")
    }

    return {
      byline: article.byline,
      markdownContent: this.formatter.turndown(article.content),
      length: article.length,
      title: article.title
    }
  }
}

/**
 * Get information about the current browser tab.
 */
const getCurrentTab = async (): Promise<BrowserTab> => {
  const tab = (await browser.tabs.query({active: true, currentWindow: true}))[0]

  if (!(tab?.id && tab.url)) {
    throw new Error("Cannot find current tab")
  }

  return {
    id: tab.id,
    url: tab.url
  }
}

/**
 * Extracts and formats content from the current browser tab.
 */
const extractContent = async (): Promise<string> => {
  const tab = await getCurrentTab()
  const pageContent: PageContent = await browser.tabs.sendMessage(tab.id, "extractContent")
  const article = new ArticleFormatter().formatArticle(pageContent.html)

  return [
    `# ${article.title}`,
    `**URL:** ${pageContent.url}`,
    `**Author:** ${article.byline}`,
    `**Image:** ${pageContent.ogImage}`,
    "---",
    article.markdownContent
  ].join("\n")
}

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
  const textarea = document.getElementById("content") as HTMLTextAreaElement
  if (!textarea) {
    throw new Error("Can't find the content textarea")
  }

  try {
    textarea.value = await extractContent()
  } catch (error) {
    textarea.value = `Error extracting content: ${error instanceof Error ? error.message : error}`
    console.error("Error extracting content:", error)
  }

  // Copy button handler
  const copyButton = document.getElementById("copy")
  if (copyButton) {
    copyButton.addEventListener("click", async (): Promise<void> => {
      try {
        await navigator.clipboard.writeText(textarea.value)

        const button = document.getElementById("copy")
        if (button) {
          button.textContent = "Copied!"
          setTimeout((): void => {
            if (button) {
              button.textContent = "Copy to Clipboard"
            }
          }, 2000)
        }
      } catch (error) {
        console.error("Error copying text:", error)
      }
    })
  }

  // Close button handler
  const closeButton = document.getElementById("close")
  if (closeButton) {
    closeButton.addEventListener("click", (): void => {
      window.close()
    })
  }
})