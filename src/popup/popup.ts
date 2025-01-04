import { Article, ArticleFormatter } from "../articleFormatter";
import { BrowserTab, PageContent } from "../types";
import PopupContext from "./popupContext";

/**
 * Get information about the current browser tab.
 */
const getCurrentTab = async (): Promise<BrowserTab> => {
  const tab = (
    await browser.tabs.query({ active: true, currentWindow: true })
  )[0];

  if (!(tab?.id && tab.url)) {
    throw new Error("Cannot find current tab");
  }

  return {
    id: tab.id,
    url: tab.url,
  };
};

/**
 * Formatted article data, ready to load into Notion.
 */
export type FormattedArticle = Article & {
  coverURL: string;
  url: string;
};

/**
 * Extracts and formats content from the current browser tab.
 */
const extractContent = async (): Promise<FormattedArticle> => {
  const tab = await getCurrentTab();
  const pageContent: PageContent = await browser.tabs.sendMessage(
    tab.id,
    "extractContent",
  );
  const article = new ArticleFormatter().formatArticle(pageContent.html);

  return {
    ...article,
    coverURL: pageContent.ogImage || "",
    url: pageContent.url,
  };
};

/**
 * Consolidates article data, so that we can copy it to clipboard as a string value.
 *
 * If the user has modified any values (e.g., by editing the Markdown content in the
 * textarea), the result will reflect these changes.
 */
const formatForCopying = (): string =>
  [
    `# ${PopupContext.articleTitle().value}`,
    `**URL:** ${PopupContext.articleURL().value}`,
    `**Author:** ${PopupContext.articleByline().value}`,
    `**Cover:** ${PopupContext.articleCoverURL().value}`,
    "---",
    PopupContext.articleContent().value,
  ].join("\n");

/**
 * Displays a toast notification.
 * @param message Message to display. Specify empty string to hide the toast
 * notification.
 */
const toast = (message: string): void => {
  const container = PopupContext.toast();
  container.classList[message === "" ? "add" : "remove"]("hidden");
  container.innerText = message;
};

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
  toast("");
  try {
    const article: FormattedArticle = await extractContent();

    PopupContext.articleByline().value = article.byline;
    PopupContext.articleContent().value = article.markdownContent;
    PopupContext.articleCoverURL().value = article.coverURL;
    PopupContext.articleTitle().value = article.title;
    PopupContext.articleURL().value = article.url;

    // Wire up copy button.
    const copyButton = PopupContext.copyButton();
    copyButton.addEventListener("click", async (): Promise<void> => {
      toast("");
      try {
        await navigator.clipboard.writeText(formatForCopying());
        copyButton.textContent = "Copied!";
        setTimeout((): void => {
          copyButton.textContent = "Copy Markdown";
        }, 2000);
      } catch (e: unknown) {
        toast(
          e instanceof Error
            ? e.message
            : `Unexpected error when copying: ${JSON.stringify(e)}`,
        );
      }
    });

    // Wire up close button.
    PopupContext.closeButton().addEventListener("click", (): void => {
      toast("");
      try {
        window.close();
      } catch (e: unknown) {
        toast(
          e instanceof Error
            ? e.message
            : `Unexpected error when closing popup: ${JSON.stringify(e)}`,
        );
      }
    });
  } catch (e: unknown) {
    toast(
      e instanceof Error
        ? e.message
        : `Unexpected error when parsing content: ${JSON.stringify(e)}`,
    );
  }
});
