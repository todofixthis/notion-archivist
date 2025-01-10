import NotionService, { TestAccessResult } from "../notion/service";
import { TemporarySettings } from "./temporarySettings";
import { ISettingsService, SettingsData } from "./types";

/**
 * Provides access to extension settings.
 */
export default class SettingsService implements ISettingsService {
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
        const validationResult = await this.validateNotionKey(settings.notionKey);
        if (validationResult && !validationResult.hasAccess) {
          throw validationResult.reason;
        }
      }
      targetSettings.notionKey = settings.notionKey;
    }

    targetSettings.parentID = settings.parentID;

    await browser.storage.sync.set(targetSettings);
    return this.getSettings(true);
  }

  /**
   * If the extension is configured with a valid API key, executes a callback with a
   * Notion API client. Otherwise, acts as a no-op.
   *
   * @param callback Called with a Notion API client as the first argument.
   * @returns The result from the callback if it was called, else `null`.
   */
  public async withNotion<RT>(
    callback: (notion: NotionService) => Promise<RT>,
  ): Promise<RT | null> {
    const apiKey = (await this.getSettings()).notionKey;
    if (apiKey !== "") {
      return callback(new NotionService(this));
    }
    return null;
  }

  /**
   * Validates the given Notion integration key.
   *
   * Note: assumes private integration (requires bearer token, not OAuth2).
   *
   * @param notionKey Notion integration secret key.
   *
   * @protected
   */
  protected async validateNotionKey(
    notionKey: string,
  ): Promise<void | TestAccessResult> {
    return new NotionService(new TemporarySettings({ notionKey })).testAccess();
  }
}
