import { ArticleFormatter } from "../articleFormatter";
import { BrowserTab, PageContent } from "../types";

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
 * Extracts and formats content from the current browser tab.
 */
const extractContent = async (): Promise<string> => {
  const tab = await getCurrentTab();
  const pageContent: PageContent = await browser.tabs.sendMessage(
    tab.id,
    "extractContent",
  );
  const article = new ArticleFormatter().formatArticle(pageContent.html);

  return [
    `# ${article.title}`,
    `**URL:** ${pageContent.url}`,
    `**Author:** ${article.byline}`,
    `**Image:** ${pageContent.ogImage}`,
    "---",
    article.markdownContent,
  ].join("\n");
};

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
  const textarea = PopupContext.markdownContent();

  try {
    textarea.value = await extractContent();
  } catch (error) {
    textarea.value = `Error extracting content: ${error instanceof Error ? error.message : error}`;
  }

  // Wire up copy button.
  const copyButton = PopupContext.copyButton();
  copyButton.addEventListener("click", async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      copyButton.textContent = "Copied!";
      setTimeout((): void => {
        copyButton.textContent = "Copy to Clipboard";
      }, 2000);
    } catch (error) {
      textarea.value = `Error copying text: ${error instanceof Error ? error.message : error}`;
    }
  });

  // Wire up close button.
  PopupContext.closeButton().addEventListener("click", (): void => {
    window.close();
  });
});
