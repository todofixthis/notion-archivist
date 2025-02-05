import { Client } from "@notionhq/client";
import {
  BlockObjectRequest,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { FormattedArticle } from "../../popup/popup";
import { ISettingsService } from "../settings/types";
import { ConfigurationError, isNotionError, NotionError } from "./errors";
import MarkdownParser from "./markdownParser";

/**
 * Result from calling {@link NotionService.testAccess}.
 */
export type TestAccessResult = {
  /** Indicates whether the Notion API client has access. */
  hasAccess: boolean;
  /** If `result` is `false`, this contains the exception explaining why. */
  reason: NotionError | null;
};

/**
 * Creates a configured Notion API client instance.
 *
 * Note: this function is generally not invoked directly; instead use
 * {@link SettingsService.withNotion} or {@link NotionService}.
 */
export const getClient = (apiKey: string): Client => new Client({ auth: apiKey });

/**
 * Wrapper for the Notion API client that provides functionality specific to this
 * extension.
 *
 * Note: this class is generally not invoked directly; instead use
 * {@link SettingsService.withNotion}.
 */
export default class NotionService {
  protected client: Client | null;
  protected settings: ISettingsService;

  public constructor(settings: ISettingsService) {
    this.client = null;
    this.settings = settings;
  }

  /**
   * Creates a new page with the specified content.
   */
  public async createPage(article: FormattedArticle): Promise<PageObjectResponse> {
    const blocks: BlockObjectRequest[] = [];

    // Insert byline if present.
    if (article.byline !== "") {
      blocks.push({
        paragraph: {
          rich_text: [
            {
              text: {
                content: "Author: ",
              },
              type: "text",
            },
            {
              annotations: { italic: true },
              text: { content: article.byline },
              type: "text",
            },
          ],
        },
        type: "paragraph",
      });
    }

    blocks.push(...MarkdownParser.blocksFromMarkdown(article.markdownContent));

    const result = await (
      await this.getClient()
    ).pages.create({
      children: blocks,
      cover: {
        external: { url: article.coverURL },
        type: "external",
      },
      parent: {
        database_id: (await this.settings.getSettings()).parentID,
        type: "database_id",
      },
      properties: {
        Name: { title: [{ text: { content: article.title } }] },
        URL: { url: article.url },
      },
    });

    return result as PageObjectResponse;
  }

  /**
   * Checks whether the client has access to the Notion API.
   */
  public async testAccess(): Promise<TestAccessResult> {
    try {
      await (await this.getClient()).search({ query: "test", page_size: 1 });
      return {
        hasAccess: true,
        reason: null,
      };
    } catch (e: unknown) {
      if (isNotionError(e)) {
        return {
          hasAccess: false,
          reason: e,
        };
      }
      throw e;
    }
  }

  /**
   * Returns a configured Notion API client.
   */
  public async getClient(): Promise<Client> {
    const apiKey = (await this.settings.getSettings()).notionKey;
    if (apiKey === "") {
      throw new ConfigurationError("Notion API key setting is empty.");
    }

    this.client ||= getClient(apiKey);
    return this.client;
  }
}
