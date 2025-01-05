import {
  Client,
  isNotionClientError,
  NotionClientError,
} from "@notionhq/client";
import { z } from "zod";

export const SettingsSchema = z.object({
  notionKey: z.string(),
  parentID: z.string(),
});

export type SettingsData = z.infer<typeof SettingsSchema>;

/**
 * Provides access to extension settings.
 */
export default class SettingsService {
  protected settings: SettingsData | undefined;

  /**
   * Lazy-load the extension settings from local storage.
   *
   * @param reload If `true`, force the extension to reload settings.
   */
  public async getSettings(reload?: boolean): Promise<SettingsData> {
    if (reload) {
      this.settings = undefined;
    }

    this.settings ||= (await browser.storage.sync.get()) as SettingsData;
    return this.settings;
  }

  /**
   * Save settings into local storage.
   *
   * Note: This will overwrite all existing settings.
   *
   * @returns the persisted settings (should match the argument value).
   */
  public async setSettings(settings: SettingsData): Promise<SettingsData> {
    const targetSettings: SettingsData = {
      ...(await this.getSettings()),
    };

    if (settings.notionKey !== targetSettings?.notionKey) {
      if (settings.notionKey) {
        const validationResult = await this.validateNotionKey(
          settings.notionKey,
        );
        if (isNotionClientError(validationResult)) {
          throw validationResult;
        }
      }
      targetSettings.notionKey = settings.notionKey;
    }

    targetSettings.parentID = settings.parentID;

    await browser.storage.sync.set(targetSettings);
    return this.getSettings(true);
  }

  /**
   * Initialises a Notion API client.
   *
   * Note: assumes private integration (requires bearer token, not OAuth2).
   *
   * @param notionKey Notion integration secret key.
   * @protected
   */
  protected async getNotionClient(notionKey?: string): Promise<null | Client> {
    notionKey ||= (await this.getSettings()).notionKey;
    return notionKey ? new Client({ auth: notionKey }) : null;
  }

  /**
   * Validates the given Notion integration key.
   *
   * Note: assumes private integration (requires bearer token, not OAuth2).
   *
   * @param notionKey Notion integration secret key.
   * @protected
   */
  protected async validateNotionKey(
    notionKey: string,
  ): Promise<void | NotionClientError> {
    const notionClient = await this.getNotionClient(notionKey);
    if (!notionClient) {
      // `notionKey` is empty, so nothing to validate.
      return;
    }

    try {
      // Try to search for a page to verify the token.
      await notionClient.search({ query: "test", page_size: 1 });
    } catch (e: unknown) {
      if (isNotionClientError(e)) {
        return e;
      }
      throw e;
    }
  }
}
