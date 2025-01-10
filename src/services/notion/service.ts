import { Client } from "@notionhq/client";
import SettingsService from "../settingsService";
import { ConfigurationError, isNotionError, NotionError } from "./errors";

/**
 * Result from calling {@link NotionService.testAccess}.
 */
export type TestAccessResult = {
  /** Whether the Notion client has access. */
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
export const getClient = (apiKey: string): Client =>
  new Client({ auth: apiKey });

/**
 * Wrapper for Notion API client to provide application-specific functionality.
 *
 * Note: this class is generally not invoked directly; instead use
 * {@link SettingsService.withNotion}.
 */
export default class NotionService {
  protected client: Client | null;
  protected settings: SettingsService;

  public constructor(settings: SettingsService) {
    this.client = null;
    this.settings = settings;
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
