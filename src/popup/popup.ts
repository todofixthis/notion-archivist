import { ArticleFormatterService } from "../services/articleFormatterService";
import SettingsService from "../services/settings/service";
import ToastService from "../services/toastService";
import { Article, BrowserTab, PageContent } from "../types";
import PopupContext from "./popupContext";

/**
 * Get information about the current browser tab.
 */
const getCurrentTab = async (): Promise<BrowserTab> => {
  const tab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];

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
  const article = new ArticleFormatterService().formatArticle(pageContent.html);

  return {
    ...article,
    coverURL: pageContent.ogImage || "",
    url: pageContent.url,
  };
};

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
  const toast = new ToastService(PopupContext.toast());

  toast.toast("");
  try {
    const article: FormattedArticle = await extractContent();

    PopupContext.articleByline().value = article.byline;
    PopupContext.articleContent().value = article.markdownContent;
    PopupContext.articleCoverURL().value = article.coverURL;
    PopupContext.articleTitle().value = article.title;
    PopupContext.articleURL().value = article.url;

    // Wire up the 'Save to Notion' button.
    const notionButton = PopupContext.notionButton();
    notionButton.addEventListener("click", async (): Promise<void> => {
      toast.toast("");
      try {
        notionButton.textContent = "Saving...";
        notionButton.disabled = true;

        await new SettingsService().withNotion(async (notion) => {
          await notion.createPage(article);
        });

        notionButton.textContent = "Copied!";
        setTimeout((): void => {
          notionButton.textContent = "Save to Notion";
          notionButton.disabled = false;
        }, 2000);
      } catch (e: unknown) {
        toast.toast(
          e instanceof Error ? e.message : `Unexpected error: ${JSON.stringify(e)}`,
        );

        notionButton.textContent = "Save to Notion";
        notionButton.disabled = false;
      }
    });

    // Wire up close button.
    PopupContext.closeButton().addEventListener("click", (): void => {
      toast.toast("");
      try {
        window.close();
      } catch (e: unknown) {
        toast.toast(
          e instanceof Error ? e.message : `Unexpected error: ${JSON.stringify(e)}`,
        );
      }
    });
  } catch (e: unknown) {
    toast.toast(
      e instanceof Error
        ? e.message
        : `Unexpected error when parsing content: ${JSON.stringify(e)}`,
    );
  }
});
